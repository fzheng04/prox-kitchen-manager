import { compareBaskets, priceLine } from '../src/logic/basket';
import { activePrice } from '../src/logic/pricing';
import { convert } from '../src/logic/units';
import { CATALOG, SEED } from '../src/state/catalog';
import { initialState, makeReducer, tripIdFor } from '../src/state/reducer';
import { loadState, saveState } from '../src/state/persistence';
import { memoryStore } from '../src/state/storage';
import type { AnalyticsEvent } from '../src/logic/analytics';

const now = new Date(SEED.seedNow);
const profile = SEED.profiles[1]; // budget profile, no pins
const reducer = makeReducer(CATALOG);
const event = (key: string): AnalyticsEvent => ({
  id: key, name: 'list_item_added', sessionId: 's', anonymousId: 'a', timestamp: '', mockTime: '', dedupeKey: key, props: {},
});

test('1 gallon equals 128 fl oz', () => {
  expect(convert(1, 'gal', 'fl_oz')).toBe(128);
  expect(convert(1, 'lb', 'fl_oz')).toBeNull();
  const vm = CATALOG.retailers.find((r) => r.id === 'valuemart')!;
  const line = priceLine({ id: 'x', itemId: 'whole-milk', text: '', quantity: 1, unit: 'gal' }, vm, '94110', { organic: false }, CATALOG, now);
  expect(line.chosen?.packages).toBe(1);
});

test('missing price is never $0 and an incomplete basket is never best', () => {
  const baskets = compareBaskets(
    [{ id: 'a', itemId: 'olive-oil', text: '', quantity: 16.9, unit: 'fl_oz' }, { id: 'b', itemId: 'avocados', text: '', quantity: 4, unit: 'ct' }],
    '94110', profile, CATALOG, now,
  );
  const vm = baskets.find((b) => b.retailer.id === 'valuemart')!;
  expect(vm.complete).toBe(false);
  expect(vm.isBestDeal).toBe(false);
  expect(vm.lines.find((l) => l.itemId === 'olive-oil')!.status).toBe('no_price');
});

test('expired special is not the active price', () => {
  const eggs = CATALOG.products.find((p) => p.id === 'freshco-eggs-1')!;
  expect(activePrice(eggs, now)).toEqual({ cents: eggs.priceCents, onSpecial: false });
});

test('repeated tap with the same request id adds once', () => {
  let s = initialState('anon');
  const add = { type: 'ADD_LIST_ITEM' as const, requestId: 'r1', item: { itemId: 'rice', text: 'Rice', quantity: 1, unit: 'lb' as const }, event: event('add:r1') };
  s = reducer(reducer(s, add), add);
  const rows = s.lists[0].items.filter((i) => i.itemId === 'rice');
  expect(rows).toHaveLength(1);
  expect(rows[0].quantity).toBe(1);
  expect(s.events).toHaveLength(1);
});

test('double trip completion applies once', () => {
  let s = initialState('anon', 'sample');
  const list = s.lists[0];
  const trip = { id: tripIdFor(list), retailerId: 'freshco', completedAt: now.toISOString(), lines: [{ itemId: 'eggs', quantity: 12, unit: 'ct' as const }], totalCents: 399, savingsCents: 0, source: 'app' as const };
  const action = { type: 'COMPLETE_TRIP' as const, trip, event: event('trip') };
  s = reducer(reducer(s, action), action);
  expect(s.trips.filter((t) => t.id === trip.id)).toHaveLength(1);
  expect(s.pantry.find((p) => p.itemId === 'eggs')!.quantity).toBe(15);
});

test('list persists across restart; corrupt data recovers', async () => {
  const store = memoryStore();
  const s = initialState('anon-1');
  await saveState(store, s);
  const loaded = await loadState(store, () => 'new');
  expect(loaded.status).toBe('restored');
  expect(loaded.state.lists).toEqual(s.lists);
  store.data.set('prox:state', '{bad');
  expect((await loadState(store, () => 'new')).status).toBe('recovered');
});
