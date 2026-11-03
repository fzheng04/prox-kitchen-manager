/**
 * Focused unit tests, one block per module. Most use small hand-built fixtures instead of the seed,
 * so each expected value can be checked by reading the test.
 */
import { appendEvent, MAX_EVENTS, type AnalyticsEvent } from '../src/logic/analytics';
import { compareBaskets, preferenceFor, priceLine, savingsVersusPriciest } from '../src/logic/basket';
import { advanceClock, clockNow, DAY_MS, daysBetween, formatDate, weekIndex, weekStart } from '../src/logic/clock';
import { discoveryPick } from '../src/logic/discovery';
import { dedupeProducts, productsFor, searchCatalog } from '../src/logic/matching';
import { formatCents, formatUnitPrice } from '../src/logic/money';
import {
  applyPurchase,
  currentQuantity,
  daysLeft,
  isLow,
  purchaseRecurrence,
  setQuantity,
  typicalAmount,
} from '../src/logic/pantry';
import { activePrice, isStale, priceAgeDays, unitPrice } from '../src/logic/pricing';
import { totalSaved, weekSummary } from '../src/logic/summary';
import type { Catalog, CatalogItem, ListItem, PantryItem, Product, Profile, Retailer, Trip } from '../src/logic/types';
import { areComparable, convert, formatQuantity, toBase, unitsForFamily } from '../src/logic/units';
import { CATALOG } from '../src/state/catalog';
import { loadState, saveState, STORAGE_KEY } from '../src/state/persistence';
import { initialState, makeReducer, tripIdFor } from '../src/state/reducer';
import { asyncStorageStore, memoryStore } from '../src/state/storage';
import type { AppState } from '../src/state/types';

// ---------------------------------------------------------------------------------------------
// Fixtures

const NOW = new Date('2026-01-05T09:00:00.000Z'); // a Monday
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY_MS).toISOString();
const daysAhead = (d: number) => new Date(NOW.getTime() + d * DAY_MS).toISOString();

const ZIP = '10001';
const shopA: Retailer = { id: 'a-mart', name: 'A Mart', short: 'A', priceFactor: 1, zips: [ZIP] };
const shopB: Retailer = { id: 'b-mart', name: 'B Mart', short: 'B', priceFactor: 1, zips: [ZIP] };

const milk: CatalogItem = { id: 'milk', name: 'Whole milk', category: 'dairy', unit: 'gal', terms: ['dairy'] };
const rice: CatalogItem = { id: 'rice', name: 'Jasmine rice', category: 'pantry', unit: 'lb', terms: ['grain'] };
const kale: CatalogItem = { id: 'kale', name: 'Kale', category: 'produce', unit: 'oz', terms: ['greens'] };

function product(over: Partial<Product> & Pick<Product, 'id' | 'retailerId' | 'itemId'>): Product {
  return {
    brand: 'House',
    name: over.id,
    size: 1,
    unit: 'ct',
    organic: false,
    priceCents: 100,
    priceUpdatedAt: NOW.toISOString(),
    zips: [ZIP],
    ...over,
  };
}

const profile = (over: Partial<Profile> = {}): Profile => ({
  id: 'p',
  name: 'Test',
  organicCategories: [],
  pinnedBrands: {},
  favoriteItemIds: [],
  discoverCategories: [],
  dismissedProductIds: [],
  ...over,
});

const listItem = (over: Partial<ListItem> = {}): ListItem => ({
  id: 'li-1',
  itemId: 'milk',
  text: 'Whole milk',
  quantity: 1,
  unit: 'gal',
  ...over,
});

const pantryItem = (over: Partial<PantryItem> = {}): PantryItem => ({
  id: 'pantry-milk',
  itemId: 'milk',
  quantity: 1,
  unit: 'gal',
  dailyUse: 0.1,
  lowThreshold: 0.25,
  updatedAt: NOW.toISOString(),
  ...over,
});

const trip = (over: Partial<Trip> = {}): Trip => ({
  id: 't',
  retailerId: 'a-mart',
  completedAt: NOW.toISOString(),
  lines: [],
  totalCents: 0,
  savingsCents: 0,
  source: 'app',
  ...over,
});

const event = (key: string, id = `id-${key}`): AnalyticsEvent => ({
  id,
  name: 'list_item_added',
  sessionId: 's',
  anonymousId: 'a',
  timestamp: '',
  mockTime: '',
  dedupeKey: key,
  props: {},
});

// ---------------------------------------------------------------------------------------------

describe('units', () => {
  test('converts within a family', () => {
    expect(convert(1, 'qt', 'fl_oz')).toBe(32);
    expect(convert(2, 'lb', 'oz')).toBe(32);
    expect(convert(1, 'dozen', 'ct')).toBe(12);
    expect(convert(1, 'kg', 'g')).toBeCloseTo(1000);
    expect(convert(1, 'l', 'ml')).toBeCloseTo(1000);
    expect(convert(64, 'fl_oz', 'gal')).toBe(0.5);
  });

  test('refuses to convert across families', () => {
    expect(convert(1, 'lb', 'gal')).toBeNull();
    expect(convert(12, 'ct', 'oz')).toBeNull();
    expect(areComparable('ml', 'qt')).toBe(true);
    expect(areComparable('g', 'ml')).toBe(false);
  });

  test('toBase reports the family and base amount', () => {
    expect(toBase(1, 'gal')).toEqual({ family: 'volume', amount: 128 });
    expect(toBase(2, 'dozen')).toEqual({ family: 'count', amount: 24 });
  });

  test('pickable units stay in the item family', () => {
    expect(unitsForFamily('volume')).toEqual(['fl_oz', 'qt', 'gal']);
    expect(unitsForFamily('weight')).toEqual(['oz', 'lb']);
    expect(unitsForFamily('count')).toEqual(['ct', 'dozen']);
  });

  test('quantities display to one decimal', () => {
    expect(formatQuantity(1.26, 'gal')).toBe('1.3 gal');
    expect(formatQuantity(12, 'ct')).toBe('12 ct');
    expect(formatQuantity(0.04, 'l')).toBe('0 L');
  });
});

describe('money', () => {
  test('formats integer cents as dollars', () => {
    expect(formatCents(0)).toBe('$0.00');
    expect(formatCents(5)).toBe('$0.05');
    expect(formatCents(123456)).toBe('$1234.56');
    expect(formatCents(-250)).toBe('-$2.50');
  });

  test('rounds stray fractional cents instead of printing them', () => {
    expect(formatCents(199.6)).toBe('$2.00');
  });

  test('unit prices keep more precision under a dollar', () => {
    expect(formatUnitPrice(3.125, 'oz')).toBe('$0.031 / oz');
    expect(formatUnitPrice(250, 'item')).toBe('$2.50 / item');
  });
});

describe('clock', () => {
  const clock = { startIso: NOW.toISOString(), offsetDays: 0 };

  test('now is the start plus whole days, and only moves when advanced', () => {
    expect(clockNow(clock).toISOString()).toBe(NOW.toISOString());
    expect(clockNow(advanceClock(clock, 3)).toISOString()).toBe(daysAhead(3));
    expect(clock.offsetDays).toBe(0);
  });

  test('week number and week start roll over every 7 days', () => {
    expect(weekIndex({ ...clock, offsetDays: 0 })).toBe(1);
    expect(weekIndex({ ...clock, offsetDays: 6 })).toBe(1);
    expect(weekIndex({ ...clock, offsetDays: 7 })).toBe(2);
    expect(weekStart({ ...clock, offsetDays: 9 }).toISOString()).toBe(daysAhead(7));
  });

  test('daysBetween is fractional and signed', () => {
    expect(daysBetween(daysAgo(1.5), NOW)).toBeCloseTo(1.5);
    expect(daysBetween(daysAhead(2), NOW)).toBeCloseTo(-2);
  });

  test('dates format in UTC so the device time zone never shifts them', () => {
    expect(formatDate(NOW)).toBe('Mon Jan 5');
  });
});

describe('weekly summary', () => {
  const trips = [
    trip({ id: 'before', completedAt: daysAgo(1), totalCents: 999, savingsCents: 99 }),
    trip({ id: 'start', completedAt: NOW.toISOString(), totalCents: 1000, savingsCents: 150 }),
    trip({ id: 'mid', completedAt: daysAhead(3), totalCents: 500, savingsCents: 25 }),
    trip({ id: 'next-week', completedAt: daysAhead(7), totalCents: 700, savingsCents: 70 }),
  ];

  test('counts trips from the week start up to, but not including, 7 days later', () => {
    expect(weekSummary(trips, NOW)).toEqual({ trips: 2, spentCents: 1500, savedCents: 175 });
  });

  test('an empty history is all zeros', () => {
    expect(weekSummary([], NOW)).toEqual({ trips: 0, spentCents: 0, savedCents: 0 });
    expect(totalSaved([])).toBe(0);
  });

  test('total saved adds up every trip', () => {
    expect(totalSaved(trips)).toBe(99 + 150 + 25 + 70);
  });
});

describe('analytics log', () => {
  test('a repeated event id is dropped even with a new dedupe key', () => {
    const log = appendEvent([event('k1', 'same')], event('k2', 'same'));
    expect(log).toHaveLength(1);
  });

  test('a duplicate returns the same array, so state does not change', () => {
    const log = [event('k')];
    expect(appendEvent(log, event('k', 'other'))).toBe(log);
  });

  test('the log keeps only the newest MAX_EVENTS', () => {
    let log: AnalyticsEvent[] = [];
    for (let i = 0; i < MAX_EVENTS + 5; i++) log = appendEvent(log, event(`k${i}`));
    expect(log).toHaveLength(MAX_EVENTS);
    expect(log[0].dedupeKey).toBe('k5');
    expect(log[log.length - 1].dedupeKey).toBe(`k${MAX_EVENTS + 4}`);
  });
});

describe('pricing', () => {
  const base = product({ id: 'p', retailerId: 'a-mart', itemId: 'milk', priceCents: 400, size: 1, unit: 'gal' });

  test('an active special replaces the regular price', () => {
    const p = { ...base, special: { priceCents: 300, endsAt: daysAhead(1) } };
    expect(activePrice(p, NOW)).toEqual({ cents: 300, onSpecial: true });
  });

  test('a special that ends exactly now has expired', () => {
    const p = { ...base, special: { priceCents: 300, endsAt: NOW.toISOString() } };
    expect(activePrice(p, NOW)).toEqual({ cents: 400, onSpecial: false });
  });

  test('a missing regular price is null, never zero', () => {
    expect(activePrice({ ...base, priceCents: null }, NOW)).toBeNull();
    expect(unitPrice({ ...base, priceCents: null }, NOW)).toBeNull();
  });

  test('a live special still prices an item whose regular price is missing', () => {
    const p = { ...base, priceCents: null, special: { priceCents: 350, endsAt: daysAhead(2) } };
    expect(activePrice(p, NOW)).toEqual({ cents: 350, onSpecial: true });
  });

  test('unit price is per base unit of the family', () => {
    expect(unitPrice(base, NOW)).toEqual({ centsPerUnit: 400 / 128, label: 'fl oz' });
  });

  test('stale means strictly older than 7 days', () => {
    expect(isStale({ ...base, priceUpdatedAt: daysAgo(7) }, NOW)).toBe(false);
    expect(isStale({ ...base, priceUpdatedAt: daysAgo(7.5) }, NOW)).toBe(true);
    expect(priceAgeDays({ ...base, priceUpdatedAt: daysAgo(7.5) }, NOW)).toBe(7);
  });
});

describe('matching', () => {
  const items = [milk, rice, kale];
  const products = [product({ id: 'r1', retailerId: 'a-mart', itemId: 'rice', brand: 'Golden Field' })];

  test('blank or punctuation-only queries return nothing', () => {
    expect(searchCatalog('', items, products)).toEqual([]);
    expect(searchCatalog('  !! ', items, products)).toEqual([]);
  });

  test('queries are case and punctuation insensitive', () => {
    expect(searchCatalog('KALE!', items, products)[0].item.id).toBe('kale');
  });

  test('search terms and brands find items whose names do not match', () => {
    expect(searchCatalog('greens', items, products).map((r) => r.item.id)).toEqual(['kale']);
    expect(searchCatalog('golden', items, products).map((r) => r.item.id)).toEqual(['rice']);
  });

  test('no match returns an empty list', () => {
    expect(searchCatalog('durian', items, products)).toEqual([]);
  });

  test('a duplicate row with a price beats one without', () => {
    const noPrice = product({ id: 'a', retailerId: 'a-mart', itemId: 'milk', priceCents: null });
    const priced = product({ id: 'b', retailerId: 'a-mart', itemId: 'milk', priceCents: 300 });
    expect(dedupeProducts([noPrice, priced]).map((p) => p.id)).toEqual(['b']);
  });

  test('different sizes or organic flags are different products', () => {
    const small = product({ id: 'a', retailerId: 'a-mart', itemId: 'milk', size: 0.5, unit: 'gal' });
    const big = product({ id: 'b', retailerId: 'a-mart', itemId: 'milk', size: 1, unit: 'gal' });
    const organic = product({ id: 'c', retailerId: 'a-mart', itemId: 'milk', size: 1, unit: 'gal', organic: true });
    expect(dedupeProducts([small, big, organic])).toHaveLength(3);
  });

  test('productsFor filters by retailer and ZIP', () => {
    const rows = [
      product({ id: 'here', retailerId: 'a-mart', itemId: 'milk' }),
      product({ id: 'other-store', retailerId: 'b-mart', itemId: 'milk' }),
      product({ id: 'other-zip', retailerId: 'a-mart', itemId: 'milk', zips: ['99999'] }),
    ];
    expect(productsFor('milk', 'a-mart', ZIP, rows).map((p) => p.id)).toEqual(['here']);
  });
});

describe('basket', () => {
  const catalog: Catalog = {
    zips: [{ code: ZIP, label: 'Test' }],
    retailers: [shopA, shopB],
    items: [milk, rice, kale],
    products: [
      product({ id: 'a-milk', retailerId: 'a-mart', itemId: 'milk', size: 1, unit: 'gal', priceCents: 400 }),
      product({ id: 'b-milk', retailerId: 'b-mart', itemId: 'milk', size: 1, unit: 'gal', priceCents: 350 }),
      product({ id: 'a-rice', retailerId: 'a-mart', itemId: 'rice', size: 2, unit: 'lb', priceCents: 300 }),
      product({ id: 'b-rice', retailerId: 'b-mart', itemId: 'rice', size: 2, unit: 'lb', priceCents: null }),
      product({ id: 'a-kale', retailerId: 'a-mart', itemId: 'kale', size: 8, unit: 'oz', priceCents: 200 }),
      product({ id: 'a-kale-org', retailerId: 'a-mart', itemId: 'kale', size: 8, unit: 'oz', priceCents: 350, organic: true }),
      product({ id: 'b-kale', retailerId: 'b-mart', itemId: 'kale', size: 8, unit: 'oz', priceCents: 180 }),
    ],
  };

  test('an unresolved entry is never priced', () => {
    const line = priceLine(listItem({ itemId: null, text: 'milk' }), shopA, ZIP, { organic: false }, catalog, NOW);
    expect(line.status).toBe('unresolved');
    expect(line.chosen).toBeUndefined();
  });

  test('a store without the item in the ZIP marks it missing', () => {
    const line = priceLine(listItem(), shopA, '99999', { organic: false }, catalog, NOW);
    expect(line.status).toBe('missing');
  });

  test('organic preference keeps the organic product and shows the cheaper one with savings', () => {
    const line = priceLine(listItem({ itemId: 'kale', quantity: 8, unit: 'oz' }), shopA, ZIP, { organic: true }, catalog, NOW);
    expect(line.chosen?.product.id).toBe('a-kale-org');
    expect(line.alternative?.product.id).toBe('a-kale');
    expect(line.alternative?.savingsCents).toBe(150);
  });

  test('when no product fits the preference, the cheapest is used and the substitution is explained', () => {
    const line = priceLine(listItem({ itemId: 'kale', quantity: 8, unit: 'oz' }), shopB, ZIP, { organic: true }, catalog, NOW);
    expect(line.status).toBe('substituted');
    expect(line.chosen?.product.id).toBe('b-kale');
    expect(line.note).toMatch(/organic option isn't sold here/i);
  });

  test('buying more than one package multiplies the cost', () => {
    const line = priceLine(listItem({ itemId: 'rice', quantity: 5, unit: 'lb' }), shopA, ZIP, { organic: false }, catalog, NOW);
    expect(line.chosen?.packages).toBe(3);
    expect(line.chosen?.costCents).toBe(900);
  });

  test('preferences come from the list item first, then the profile', () => {
    const p = profile({ organicCategories: ['produce'], pinnedBrands: { kale: 'Farm' } });
    expect(preferenceFor(listItem({ itemId: 'kale' }), p, catalog)).toEqual({ brand: 'Farm', organic: true });
    expect(preferenceFor(listItem({ itemId: 'kale', organic: false, pinnedBrand: 'Other' }), p, catalog)).toEqual({
      brand: 'Other',
      organic: false,
    });
  });

  test('a store missing one price is incomplete, excludes it from the total, and is flagged as cheaper', () => {
    const items = [listItem(), listItem({ id: 'li-2', itemId: 'rice', quantity: 2, unit: 'lb' })];
    const [first, second] = compareBaskets(items, ZIP, profile(), catalog, NOW);
    expect(first.retailer.id).toBe('a-mart');
    expect(first).toMatchObject({ complete: true, isBestDeal: true, totalCents: 700 });
    expect(second.retailer.id).toBe('b-mart');
    expect(second).toMatchObject({ complete: false, isBestDeal: false, totalCents: 350, cheaperButIncomplete: true });
    expect(second.missing.map((l) => l.itemId)).toEqual(['rice']);
  });

  test('an empty list has no best deal', () => {
    const baskets = compareBaskets([], ZIP, profile(), catalog, NOW);
    expect(baskets.some((b) => b.isBestDeal || b.complete)).toBe(false);
  });

  test('savings are measured against the priciest complete basket', () => {
    const baskets = compareBaskets([listItem()], ZIP, profile(), catalog, NOW);
    const cheap = baskets.find((b) => b.retailer.id === 'b-mart')!;
    expect(savingsVersusPriciest(cheap, baskets)).toBe(50);
  });

  test('no savings are claimed for an incomplete basket or with nothing to compare against', () => {
    const one = compareBaskets([listItem()], ZIP, profile(), { ...catalog, retailers: [shopA] }, NOW);
    expect(savingsVersusPriciest(one[0], one)).toBe(0);
    const mixed = compareBaskets([listItem({ itemId: 'rice', quantity: 2, unit: 'lb' })], ZIP, profile(), catalog, NOW);
    expect(savingsVersusPriciest(mixed.find((b) => !b.complete)!, mixed)).toBe(0);
  });
});

describe('pantry', () => {
  test('stock is used up over time but never goes below zero', () => {
    const item = pantryItem({ quantity: 1, dailyUse: 0.1 });
    expect(currentQuantity(item, new Date(daysAhead(5)))).toBeCloseTo(0.5);
    expect(currentQuantity(item, new Date(daysAhead(30)))).toBe(0);
  });

  test('time before the last measurement does not add stock', () => {
    expect(currentQuantity(pantryItem({ quantity: 1 }), new Date(daysAgo(3)))).toBe(1);
  });

  test('an item that is not used up never runs out', () => {
    expect(daysLeft(pantryItem({ dailyUse: 0 }), NOW)).toBe(Infinity);
  });

  test('low means at or below the threshold', () => {
    expect(isLow(pantryItem({ quantity: 0.25, lowThreshold: 0.25 }), NOW)).toBe(true);
    expect(isLow(pantryItem({ quantity: 0.26, lowThreshold: 0.25 }), NOW)).toBe(false);
  });

  test('setting a quantity clamps negatives and re-measures from now', () => {
    const later = new Date(daysAhead(2));
    expect(setQuantity(pantryItem(), -3, later)).toMatchObject({ quantity: 0, updatedAt: later.toISOString() });
  });

  test('a purchase in an incompatible unit is skipped and reported, not guessed', () => {
    const pantry = [pantryItem()];
    const out = applyPurchase(pantry, [{ itemId: 'milk', quantity: 2, unit: 'lb' }], NOW);
    expect(out.pantry[0].quantity).toBe(1);
    expect(out.skipped).toHaveLength(1);
  });

  test('buying the same item twice in one trip adds both lines', () => {
    const out = applyPurchase(
      [],
      [
        { itemId: 'rice', quantity: 2, unit: 'lb' },
        { itemId: 'rice', quantity: 16, unit: 'oz' },
      ],
      NOW,
    );
    expect(out.pantry).toHaveLength(1);
    expect(out.pantry[0].quantity).toBe(3);
  });

  test('recurrence needs two purchases and uses the average gap', () => {
    const line = { itemId: 'rice', quantity: 1, unit: 'lb' as const };
    expect(purchaseRecurrence('rice', [trip({ lines: [line] })])).toBeNull();
    const history = [
      trip({ id: '1', completedAt: daysAgo(12), lines: [line] }),
      trip({ id: '2', completedAt: daysAgo(6), lines: [line] }),
      trip({ id: '3', completedAt: daysAgo(4), lines: [{ itemId: 'milk', quantity: 1, unit: 'gal' }] }),
      trip({ id: '4', completedAt: NOW.toISOString(), lines: [line] }),
    ];
    const r = purchaseRecurrence('rice', history)!;
    expect(r.everyDays).toBe(6);
    expect(r.dueAt.toISOString()).toBe(daysAhead(6));
  });

  test('typical amount: last purchase, else one package, else one unit', () => {
    const pkg = product({ id: 'a-rice', retailerId: 'a-mart', itemId: 'rice', size: 2, unit: 'lb' });
    const bought = [trip({ lines: [{ itemId: 'rice', quantity: 5, unit: 'lb' }] })];
    expect(typicalAmount(rice, [pkg], bought)).toEqual({ quantity: 5, unit: 'lb' });
    expect(typicalAmount(rice, [pkg], [])).toEqual({ quantity: 2, unit: 'lb' });
    expect(typicalAmount(rice, [], [])).toEqual({ quantity: 1, unit: 'lb' });
  });
});

describe('discovery', () => {
  const catalog: Catalog = {
    zips: [{ code: ZIP, label: 'Test' }],
    retailers: [shopA],
    items: [milk, kale],
    products: [
      product({ id: 'kale-plain', retailerId: 'a-mart', itemId: 'kale', priceCents: 200 }),
      product({ id: 'kale-org', retailerId: 'a-mart', itemId: 'kale', priceCents: 300, organic: true }),
      product({ id: 'milk-1', retailerId: 'a-mart', itemId: 'milk', priceCents: null }),
    ],
  };
  const args = { catalog, zip: ZIP, retailerId: 'a-mart', pantry: [], onListItemIds: [], history: [], now: NOW };

  test('an unknown store gives no pick', () => {
    expect(discoveryPick({ ...args, retailerId: 'nowhere', profile: profile({ discoverCategories: ['produce'] }) })).toBeNull();
  });

  test('only categories the user asked to discover are considered', () => {
    expect(discoveryPick({ ...args, profile: profile({ discoverCategories: [] }) })).toBeNull();
  });

  test('products without a current price are never suggested', () => {
    expect(discoveryPick({ ...args, profile: profile({ discoverCategories: ['dairy'] }) })).toBeNull();
  });

  test('an organic preference rules out non-organic products, even cheaper ones', () => {
    const pick = discoveryPick({ ...args, profile: profile({ discoverCategories: ['produce'], organicCategories: ['produce'] }) });
    expect(pick?.product.id).toBe('kale-org');
  });

  test('items already owned, listed or bought are not new', () => {
    const p = profile({ discoverCategories: ['produce'] });
    expect(discoveryPick({ ...args, profile: p, onListItemIds: ['kale'] })).toBeNull();
    expect(discoveryPick({ ...args, profile: p, pantry: [pantryItem({ itemId: 'kale' })] })).toBeNull();
    expect(discoveryPick({ ...args, profile: p, history: [trip({ lines: [{ itemId: 'kale', quantity: 1, unit: 'oz' }] })] })).toBeNull();
  });

  test('without an organic preference the cheaper product wins', () => {
    expect(discoveryPick({ ...args, profile: profile({ discoverCategories: ['produce'] }) })?.product.id).toBe('kale-plain');
  });
});

describe('reducer', () => {
  const reducer = makeReducer(CATALOG);
  const empty = () => initialState('anon', 'fresh');
  const add = (s: AppState, requestId: string, item: Omit<ListItem, 'id'>) =>
    reducer(s, { type: 'ADD_LIST_ITEM', requestId, item, event: event(`add:${requestId}`) });
  const items = (s: AppState) => s.lists.find((l) => l.id === s.activeListId)!.items;
  const revision = (s: AppState) => s.lists.find((l) => l.id === s.activeListId)!.revision;

  test('adding the same item again merges compatible quantities into one row', () => {
    let s = add(empty(), 'r1', { itemId: 'whole-milk', text: 'Whole milk', quantity: 1, unit: 'gal' });
    s = add(s, 'r2', { itemId: 'whole-milk', text: 'Whole milk', quantity: 2, unit: 'gal' });
    expect(items(s)).toHaveLength(1);
    expect(items(s)[0].quantity).toBe(3);
  });

  test('typed notes are never merged with each other', () => {
    let s = add(empty(), 'r1', { itemId: null, text: 'milk', quantity: 1, unit: 'ct' });
    s = add(s, 'r2', { itemId: null, text: 'milk', quantity: 1, unit: 'ct' });
    expect(items(s)).toHaveLength(2);
  });

  test('every list edit bumps the revision, so request and trip ids change', () => {
    let s = add(empty(), 'r1', { itemId: 'eggs', text: 'Eggs', quantity: 12, unit: 'ct' });
    const r = revision(s);
    const id = items(s)[0].id;
    s = reducer(s, { type: 'UPDATE_LIST_ITEM', listItemId: id, patch: { quantity: 24 } });
    expect(items(s)[0].quantity).toBe(24);
    expect(revision(s)).toBe(r + 1);
    s = reducer(s, { type: 'REMOVE_LIST_ITEM', listItemId: id });
    expect(items(s)).toEqual([]);
    expect(revision(s)).toBe(r + 2);
  });

  test('resolving to an item sold in another unit family adopts that unit', () => {
    let s = add(empty(), 'r1', { itemId: null, text: 'rice', quantity: 1, unit: 'ct' });
    s = reducer(s, { type: 'RESOLVE_LIST_ITEM', listItemId: items(s)[0].id, itemId: 'rice' });
    const rice = CATALOG.items.find((i) => i.id === 'rice')!;
    expect(items(s)[0]).toMatchObject({ itemId: 'rice', text: rice.name, unit: rice.unit });
  });

  test('resolving to an unknown item changes nothing', () => {
    const s = add(empty(), 'r1', { itemId: null, text: 'thing', quantity: 1, unit: 'ct' });
    expect(reducer(s, { type: 'RESOLVE_LIST_ITEM', listItemId: items(s)[0].id, itemId: 'nope' })).toBe(s);
  });

  test('invalid ids for lists, ZIPs and profiles are ignored', () => {
    const s = empty();
    expect(reducer(s, { type: 'CREATE_LIST', id: s.activeListId, name: 'Dup' })).toBe(s);
    expect(reducer(s, { type: 'SET_ACTIVE_LIST', listId: 'missing' })).toBe(s);
    expect(reducer(s, { type: 'SET_ZIP', zip: '00000' })).toBe(s);
    expect(reducer(s, { type: 'SET_PROFILE', profileId: 'missing' })).toBe(s);
    expect(reducer(s, { type: 'ADD_PANTRY_ITEM', requestId: 'x', line: { itemId: 'nope', quantity: 1, unit: 'ct' } })).toBe(s);
  });

  test('a new list becomes the active one', () => {
    const s = reducer(empty(), { type: 'CREATE_LIST', id: 'l2', name: 'Party' });
    expect(s.activeListId).toBe('l2');
    expect(s.lists).toHaveLength(2);
  });

  test('completing a trip removes what was bought and keeps the rest on the list', () => {
    let s = add(empty(), 'r1', { itemId: 'eggs', text: 'Eggs', quantity: 12, unit: 'ct' });
    s = add(s, 'r2', { itemId: 'rice', text: 'Rice', quantity: 2, unit: 'lb' });
    s = add(s, 'r3', { itemId: null, text: 'snacks', quantity: 1, unit: 'ct' });
    const list = s.lists.find((l) => l.id === s.activeListId)!;
    s = reducer(s, {
      type: 'COMPLETE_TRIP',
      trip: trip({ id: tripIdFor(list), lines: [{ itemId: 'eggs', quantity: 12, unit: 'ct' }] }),
      event: event('trip'),
    });
    expect(items(s).map((i) => i.text)).toEqual(['Rice', 'snacks']);
    expect(s.pantry.map((p) => p.itemId)).toEqual(['eggs']);
    expect(s.trips).toHaveLength(1);
  });

  test('advancing the clock raises a simulated reminder once stock runs low, and it can be dismissed', () => {
    let s = reducer(empty(), { type: 'ADD_PANTRY_ITEM', requestId: 'p', line: { itemId: 'eggs', quantity: 12, unit: 'ct' } });
    s = reducer(s, { type: 'ADVANCE_CLOCK', days: 1 });
    expect(s.reminder).toBeNull();
    s = reducer(s, { type: 'ADVANCE_CLOCK', days: 10 });
    expect(s.reminder?.itemId).toBe('eggs');
    const eggs = CATALOG.items.find((i) => i.id === 'eggs')!;
    expect(s.reminder?.text.startsWith(`${eggs.name}: Down to`)).toBe(true);
    s = reducer(s, { type: 'DISMISS_REMINDER' });
    expect(s.reminder).toBeNull();
  });

  test('editing pantry stock re-measures at the mock time', () => {
    let s = reducer(empty(), { type: 'ADD_PANTRY_ITEM', requestId: 'p', line: { itemId: 'eggs', quantity: 12, unit: 'ct' } });
    s = reducer(s, { type: 'ADVANCE_CLOCK', days: 3 });
    s = reducer(s, { type: 'SET_PANTRY_QUANTITY', pantryId: s.pantry[0].id, quantity: 6 });
    expect(s.pantry[0]).toMatchObject({ quantity: 6, updatedAt: clockNow(s.clock).toISOString() });
  });

  test('dismissing the same product twice stores it once', () => {
    let s = empty();
    s = reducer(s, { type: 'DISMISS_DISCOVERY', productId: 'x' });
    s = reducer(s, { type: 'DISMISS_DISCOVERY', productId: 'x' });
    expect(s.profiles.find((p) => p.id === s.activeProfileId)!.dismissedProductIds).toEqual(['x']);
  });

  test('the request-id memory is capped so it cannot grow forever', () => {
    let s = empty();
    for (let i = 0; i < 120; i++) s = add(s, `r${i}`, { itemId: null, text: `n${i}`, quantity: 1, unit: 'ct' });
    expect(s.processedRequestIds).toHaveLength(100);
    expect(s.processedRequestIds[0]).toBe('r20');
  });

  test('logged events go through de-duplication', () => {
    let s = empty();
    s = reducer(s, { type: 'LOG_EVENT', event: event('session') });
    s = reducer(s, { type: 'LOG_EVENT', event: event('session', 'another-id') });
    expect(s.events).toHaveLength(1);
  });
});

describe('persistence', () => {
  test('a full state round-trips through storage unchanged', async () => {
    const store = memoryStore();
    const s = initialState('anon');
    await saveState(store, s);
    const loaded = await loadState(store, () => 'unused');
    expect(loaded).toEqual({ status: 'restored', state: s });
  });

  test('valid JSON with the wrong shape is rejected and reported', async () => {
    const store = memoryStore({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, state: { lists: 'nope' } }) });
    const loaded = await loadState(store, () => 'anon-new');
    expect(loaded.status).toBe('recovered');
    expect(loaded.state.anonymousId).toBe('anon-new');
    if (loaded.status === 'recovered') expect(loaded.error).toMatch(/unexpected shape/);
  });

  test('the real AsyncStorage adapter saves, loads and removes (official Jest mock)', async () => {
    const s = initialState('anon-device');
    await saveState(asyncStorageStore, s);
    expect((await loadState(asyncStorageStore, () => 'unused')).state).toEqual(s);
    await asyncStorageStore.removeItem(STORAGE_KEY);
    expect(await asyncStorageStore.getItem(STORAGE_KEY)).toBeNull();
  });

  test('the anonymous id survives a restart instead of being regenerated', async () => {
    const store = memoryStore();
    const first = await loadState(store, () => 'anon-first');
    await saveState(store, first.state);
    const second = await loadState(store, () => 'anon-second');
    expect(second.state.anonymousId).toBe('anon-first');
  });
});
