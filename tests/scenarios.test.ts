import { appendEvent, type AnalyticsEvent } from '../src/logic/analytics';
import { compareBaskets, priceLine } from '../src/logic/basket';
import { advanceClock, clockNow } from '../src/logic/clock';
import { discoveryPick } from '../src/logic/discovery';
import { dedupeProducts, isAmbiguous, searchCatalog } from '../src/logic/matching';
import { formatCents } from '../src/logic/money';
import { applyPurchase, restockSuggestions } from '../src/logic/pantry';
import { isStale } from '../src/logic/pricing';
import type { Catalog, Product, Profile } from '../src/logic/types';
import { CATALOG, SEED } from '../src/state/catalog';
import { loadState, saveState, STORAGE_KEY } from '../src/state/persistence';
import { initialState, makeReducer } from '../src/state/reducer';
import { memoryStore } from '../src/state/storage';

const now = new Date(SEED.seedNow);
const reducer = makeReducer(CATALOG);
const organic = SEED.profiles[0];
const budget = SEED.profiles[1];
const retailer = (id: string) => CATALOG.retailers.find((r) => r.id === id)!;
const event = (key: string): AnalyticsEvent => ({
  id: `id-${key}`, name: 'list_item_added', sessionId: 's', anonymousId: 'a', timestamp: '', mockTime: '', dedupeKey: key, props: {},
});

describe('pricing and matching', () => {
  test('brand preference wins over a cheaper product, and the cheaper one is shown with savings', () => {
    const line = priceLine(
      { id: 'pb', itemId: 'peanut-butter', text: '', quantity: 16, unit: 'oz' },
      retailer('freshco'), '94110', { brand: 'Hillside', organic: false }, CATALOG, now,
    );
    expect(line.status).toBe('matched');
    expect(line.chosen?.product.brand).toBe('Hillside');
    expect(line.alternative?.product.brand).toBe('Value Pick');
    expect(line.alternative?.savingsCents).toBe(449 - 299);
  });

  test('weight vs volume is marked not comparable instead of converted', () => {
    const line = priceLine(
      { id: 'h', itemId: 'honey', text: '', quantity: 12, unit: 'oz' },
      retailer('greenleaf'), '94110', { organic: false }, CATALOG, now,
    );
    expect(line.status).toBe('not_comparable');
    expect(line.chosen).toBeUndefined();
  });

  test('prices older than 7 mock days are flagged stale but still priced', () => {
    const rice = CATALOG.products.find((p) => p.id === 'greenleaf-rice-1')!;
    expect(isStale(rice, now)).toBe(true);
    const line = priceLine({ id: 'r', itemId: 'rice', text: '', quantity: 5, unit: 'lb' }, retailer('greenleaf'), '94110', { organic: false }, CATALOG, now);
    expect(line.stale).toBe(true);
    expect(line.chosen).toBeDefined();
  });

  test('duplicate feed rows collapse to one product, so nothing is double counted', () => {
    const bananas = CATALOG.products.filter((p) => p.retailerId === 'freshco' && p.itemId === 'bananas');
    expect(bananas).toHaveLength(2);
    expect(dedupeProducts(bananas)).toHaveLength(1);
    const baskets = compareBaskets([{ id: 'b', itemId: 'bananas', text: '', quantity: 6, unit: 'ct' }], '94110', budget, CATALOG, now);
    expect(baskets.find((b) => b.retailer.id === 'freshco')!.totalCents).toBe(6 * 29);
  });

  test('package sizes round up to whole packages', () => {
    const line = priceLine({ id: 'm', itemId: 'whole-milk', text: '', quantity: 1, unit: 'gal' }, retailer('greenleaf'), '94110', { organic: false }, CATALOG, now);
    expect(line.chosen?.packages).toBe(2); // 64 fl oz half-gallons
  });

  test('ZIP availability changes what a store can supply', () => {
    const items = [{ id: 'c', itemId: 'chicken', text: '', quantity: 2, unit: 'lb' as const }];
    const inFirst = compareBaskets(items, '94110', budget, CATALOG, now).find((b) => b.retailer.id === 'greenleaf')!;
    const inSecond = compareBaskets(items, '94612', budget, CATALOG, now).find((b) => b.retailer.id === 'greenleaf')!;
    expect(inFirst.complete).toBe(true);
    expect(inSecond.complete).toBe(false);
  });

  test('basket ranking is deterministic when totals tie', () => {
    const retailers = [
      { id: 'b-store', name: 'B', short: 'B', priceFactor: 1, zips: ['1'] },
      { id: 'a-store', name: 'A', short: 'A', priceFactor: 1, zips: ['1'] },
    ];
    const product = (retailerId: string): Product => ({
      id: `${retailerId}-x`, retailerId, itemId: 'x', brand: 'Z', name: 'Z x', size: 1, unit: 'ct', organic: false,
      priceCents: 100, priceUpdatedAt: SEED.seedNow, zips: ['1'],
    });
    const catalog: Catalog = {
      zips: [{ code: '1', label: '' }], retailers,
      items: [{ id: 'x', name: 'X', category: 'pantry', unit: 'ct', terms: [] }],
      products: [product('b-store'), product('a-store')],
    };
    const ranked = compareBaskets([{ id: 'l', itemId: 'x', text: 'X', quantity: 1, unit: 'ct' }], '1', budget, catalog, now);
    expect(ranked.map((b) => b.retailer.id)).toEqual(['a-store', 'b-store']);
    expect(ranked[0].isBestDeal).toBe(true);
  });

  test('search ranks exact names first and flags ambiguous queries', () => {
    const milk = searchCatalog('milk', CATALOG.items, CATALOG.products);
    expect(isAmbiguous(milk)).toBe(true);
    expect(milk.map((r) => r.item.id)).toEqual(expect.arrayContaining(['whole-milk', 'oat-milk', 'almond-milk']));
    const whole = searchCatalog('Whole milk', CATALOG.items, CATALOG.products);
    expect(whole[0].item.id).toBe('whole-milk');
    expect(isAmbiguous(whole)).toBe(false);
    expect(searchCatalog('zzzz', CATALOG.items, CATALOG.products)).toEqual([]);
  });

  test('money formats from integer cents', () => {
    expect(formatCents(0)).toBe('$0.00');
    expect(formatCents(2874)).toBe('$28.74');
    expect(formatCents(-5)).toBe('-$0.05');
  });
});

describe('pantry and restock', () => {
  test('empty pantry gives no stock-based suggestions and no crash', () => {
    const profile: Profile = { ...budget, favoriteItemIds: [] };
    const out = restockSuggestions({ pantry: [], history: [], profile, catalog: CATALOG, onListItemIds: [], now });
    expect(out).toEqual([]);
  });

  test('every suggestion has a reason, and list items are left out', () => {
    const out = restockSuggestions({ pantry: SEED.pantry, history: SEED.history, profile: organic, catalog: CATALOG, onListItemIds: ['eggs'], now });
    expect(out.length).toBeGreaterThan(0);
    for (const s of out) expect(s.reasons.length).toBeGreaterThan(0);
    expect(out.some((s) => s.itemId === 'eggs')).toBe(false);
  });

  test('weekly clock rollover changes the recommendation through consumption, not a script', () => {
    const args = { pantry: SEED.pantry, history: SEED.history, profile: organic, catalog: CATALOG, onListItemIds: [] };
    const clock = { startIso: SEED.seedNow, offsetDays: 0 };
    const week1 = restockSuggestions({ ...args, now: clockNow(clock) }).map((s) => s.itemId);
    const week2 = restockSuggestions({ ...args, now: clockNow(advanceClock(clock, 7)) }).map((s) => s.itemId);
    expect(week2).not.toEqual(week1);
    // Peanut butter: 9 oz at 0.9 oz/day. Week 1 it has 10 days left; after 7 days it is 2.7 oz,
    // below its 4 oz restock point, so it only appears in week 2.
    expect(week1).not.toContain('peanut-butter');
    expect(week2).toContain('peanut-butter');
  });

  test('a purchase converts units into the pantry unit', () => {
    const { pantry } = applyPurchase(SEED.pantry, [{ itemId: 'whole-milk', quantity: 128, unit: 'fl_oz' }], now);
    expect(pantry.find((p) => p.itemId === 'whole-milk')!.quantity).toBeCloseTo(1.3);
  });

  test('completing a trip moves the usual-restock date', () => {
    let s = initialState('anon', 'sample');
    const before = restockSuggestions({ pantry: s.pantry, history: s.trips, profile: organic, catalog: CATALOG, onListItemIds: [], now });
    expect(before.find((x) => x.itemId === 'coffee')?.reasons.map((r) => r.kind)).toContain('purchase_recurrence');
    s = reducer(s, {
      type: 'COMPLETE_TRIP',
      trip: { id: 't1', retailerId: 'freshco', completedAt: now.toISOString(), lines: [{ itemId: 'coffee', quantity: 12, unit: 'oz' }], totalCents: 999, savingsCents: 0, source: 'app' },
      event: event('trip-t1'),
    });
    const after = restockSuggestions({ pantry: s.pantry, history: s.trips, profile: organic, catalog: CATALOG, onListItemIds: [], now });
    expect(after.find((x) => x.itemId === 'coffee')).toBeUndefined();
  });
});

describe('discovery', () => {
  const args = { catalog: CATALOG, zip: '94110', retailerId: 'freshco', pantry: SEED.pantry, onListItemIds: [], history: SEED.history, now };

  test('respects category, organic preference and store availability, and explains why', () => {
    const pick = discoveryPick({ ...args, profile: organic })!;
    expect(organic.discoverCategories).toContain(pick.item.category);
    if (organic.organicCategories.includes(pick.item.category)) expect(pick.product.organic).toBe(true);
    expect(pick.product.retailerId).toBe('freshco');
    expect(pick.reasons.length).toBeGreaterThan(0);
  });

  test('dismissing a pick persists per profile and changes future ranking', () => {
    let s = initialState('anon');
    const first = discoveryPick({ ...args, profile: s.profiles[0] })!;
    s = reducer(s, { type: 'DISMISS_DISCOVERY', productId: first.product.id });
    expect(s.profiles[0].dismissedProductIds).toEqual([first.product.id]);
    expect(s.profiles[1].dismissedProductIds).toEqual([]);
    const second = discoveryPick({ ...args, profile: s.profiles[0] })!;
    expect(second.product.id).not.toBe(first.product.id);
    // Same-category picks are penalized after a dismissal.
    if (second.item.category === first.item.category) expect(second.score).toBeLessThan(first.score);
  });
});

describe('empty and sample kitchens', () => {
  test('an empty kitchen has no pantry, list items, trips or favorites, and nothing to suggest', () => {
    const s = initialState('anon', 'fresh');
    expect(s.pantry).toEqual([]);
    expect(s.trips).toEqual([]);
    expect(s.lists).toHaveLength(1);
    expect(s.lists[0].items).toEqual([]);
    expect(s.profiles.every((p) => p.favoriteItemIds.length === 0)).toBe(true);
    const out = restockSuggestions({ pantry: s.pantry, history: s.trips, profile: s.profiles[0], catalog: CATALOG, onListItemIds: [], now });
    expect(out).toEqual([]);
  });

  test('the default start loads the seeded pantry, lists and history', () => {
    const s = initialState('anon');
    expect(s.pantry).toEqual(SEED.pantry);
    expect(s.lists).toEqual(SEED.lists);
    expect(s.trips).toEqual(SEED.history);
  });

  test('adding a pantry item by hand applies once per request id and merges compatible units', () => {
    let s = initialState('anon', 'fresh');
    const add = { type: 'ADD_PANTRY_ITEM' as const, requestId: 'p1', line: { itemId: 'whole-milk', quantity: 1, unit: 'gal' as const } };
    s = reducer(reducer(s, add), add);
    expect(s.pantry).toHaveLength(1);
    expect(s.pantry[0].quantity).toBe(1);
    s = reducer(s, { type: 'ADD_PANTRY_ITEM', requestId: 'p2', line: { itemId: 'whole-milk', quantity: 64, unit: 'fl_oz' } });
    expect(s.pantry[0].quantity).toBe(1.5);
    s = reducer(s, { type: 'REMOVE_PANTRY_ITEM', pantryId: s.pantry[0].id });
    expect(s.pantry).toEqual([]);
  });

  test('a fresh pantry item becomes a restock suggestion once the clock runs it low', () => {
    let s = initialState('anon', 'fresh');
    s = reducer(s, { type: 'ADD_PANTRY_ITEM', requestId: 'p1', line: { itemId: 'eggs', quantity: 12, unit: 'ct' } });
    const at = (days: number) =>
      restockSuggestions({ pantry: s.pantry, history: s.trips, profile: s.profiles[0], catalog: CATALOG, onListItemIds: [], now: clockNow(advanceClock(s.clock, days)) });
    // Defaults: lasts two weeks, low at a quarter left (day ~10.5).
    expect(at(0)).toEqual([]);
    expect(at(7)).toEqual([]);
    expect(at(11)[0]?.reasons.map((r) => r.kind)).toEqual(['low_quantity']);
  });
});

describe('state, analytics and persistence', () => {
  test('events with the same dedupe key are stored once', () => {
    const log = appendEvent(appendEvent([], event('k')), { ...event('k'), id: 'other-id' });
    expect(log).toHaveLength(1);
  });

  test('guest user works without login: anonymous id, list edits and comparison', () => {
    let s = initialState('anon-guest');
    expect(s.anonymousId).toBe('anon-guest');
    s = reducer(s, { type: 'CREATE_LIST', id: 'l-new', name: 'Mine' });
    s = reducer(s, { type: 'ADD_LIST_ITEM', requestId: 'r', item: { itemId: 'eggs', text: 'Eggs', quantity: 12, unit: 'ct' }, event: event('a') });
    const list = s.lists.find((l) => l.id === 'l-new')!;
    expect(list.items).toHaveLength(1);
    expect(compareBaskets(list.items, s.zip, s.profiles[0], CATALOG, now).length).toBeGreaterThanOrEqual(3);
  });

  test('manual resolution turns an ambiguous entry into a catalog item', () => {
    let s = reducer(initialState('a', 'sample'), { type: 'SET_ACTIVE_LIST', listId: 'list-breakfast' });
    const milk = s.lists.find((l) => l.id === 'list-breakfast')!.items.find((i) => i.text === 'milk')!;
    expect(milk.itemId).toBeNull();
    s = reducer(s, { type: 'RESOLVE_LIST_ITEM', listItemId: milk.id, itemId: 'oat-milk' });
    expect(s.lists.find((l) => l.id === 'list-breakfast')!.items.find((i) => i.id === milk.id)!.itemId).toBe('oat-milk');
  });

  test('write failures surface as errors; read failures fall back to seed with a reason', async () => {
    const store = memoryStore({}, { write: true });
    await expect(saveState(store, initialState('a'))).rejects.toThrow('Simulated write failure');
    store.fail = { read: true };
    const loaded = await loadState(store, () => 'fresh');
    expect(loaded.status).toBe('recovered');
  });

  test('a new install gets a fresh anonymous id; an unknown schema version is not trusted', async () => {
    const store = memoryStore();
    expect((await loadState(store, () => 'anon-new')).state.anonymousId).toBe('anon-new');
    store.data.set(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, state: initialState('x') }));
    expect((await loadState(store, () => 'anon-new')).status).toBe('recovered');
  });
});
