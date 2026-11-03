import { appendEvent } from '../logic/analytics';
import { advanceClock, clockNow } from '../logic/clock';
import { applyPurchase, restockSuggestions, setQuantity } from '../logic/pantry';
import type { Catalog, ListItem, Seed, ShoppingList } from '../logic/types';
import { areComparable } from '../logic/units';
import { CATALOG, SEED } from './catalog';
import type { Action, AppState, Reminder } from './types';

const MAX_REQUEST_IDS = 100;

export type Scenario = 'fresh' | 'sample';

export const FIRST_LIST_ID = 'list-mine';

/**
 * Starting state. `sample` (the default) loads the seeded pantry, lists, history and favorites.
 * `fresh` is an empty kitchen: empty pantry, one empty list, no trips and no favorites. Household
 * preferences (organic, pinned brands, discovery categories) stay in both.
 */
export function initialState(anonymousId: string, scenario: Scenario = 'sample', seed: Seed = SEED): AppState {
  const base = {
    anonymousId,
    clock: { startIso: seed.seedNow, offsetDays: 0 },
    zip: seed.zips[0].code,
    activeProfileId: seed.profiles[0].id,
    events: [],
    processedRequestIds: [],
    reminder: null,
  };
  if (scenario === 'sample') {
    return { ...base, profiles: seed.profiles, pantry: seed.pantry, lists: seed.lists, activeListId: seed.lists[0].id, trips: seed.history };
  }
  return {
    ...base,
    profiles: seed.profiles.map((p) => ({ ...p, favoriteItemIds: [], dismissedProductIds: [] })),
    pantry: [],
    lists: [{ id: FIRST_LIST_ID, name: 'My list', revision: 1, items: [] }],
    activeListId: FIRST_LIST_ID,
    trips: [],
  };
}

export function activeList(state: AppState): ShoppingList {
  return state.lists.find((l) => l.id === state.activeListId) ?? state.lists[0];
}

export function activeProfile(state: AppState) {
  return state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0];
}

/** Id used for completing the active list at its current revision. A double tap reuses it. */
export function tripIdFor(list: ShoppingList): string {
  return `trip-${list.id}-r${list.revision}`;
}

function updateActiveList(state: AppState, change: (items: ListItem[]) => ListItem[]): AppState {
  return {
    ...state,
    lists: state.lists.map((l) =>
      l.id === state.activeListId ? { ...l, items: change(l.items), revision: l.revision + 1 } : l,
    ),
  };
}

/** The top restock suggestion becomes a simulated in-app reminder (no real notifications). */
function reminderFor(state: AppState, catalog: Catalog): Reminder | null {
  const now = clockNow(state.clock);
  const [top] = restockSuggestions({
    pantry: state.pantry,
    history: state.trips,
    profile: activeProfile(state),
    catalog,
    onListItemIds: activeList(state).items.flatMap((i) => (i.itemId ? [i.itemId] : [])),
    now,
  });
  if (!top) return null;
  return { itemId: top.itemId, text: `${top.name}: ${top.reasons[0].text}`, createdAt: now.toISOString() };
}

export function makeReducer(catalog: Catalog) {
  return function reducer(state: AppState, action: Action): AppState {
    const now = clockNow(state.clock);
    switch (action.type) {
      case 'ADD_LIST_ITEM': {
        if (state.processedRequestIds.includes(action.requestId)) return state;
        const seen = [...state.processedRequestIds, action.requestId].slice(-MAX_REQUEST_IDS);
        const list = activeList(state);
        const existing = action.item.itemId ? list.items.find((i) => i.itemId === action.item.itemId) : undefined;
        const next = updateActiveList(state, (items) => {
          // Adding an item that's already on the list merges into the existing row instead of duplicating it.
          if (existing && areComparable(existing.unit, action.item.unit)) {
            return items.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + action.item.quantity } : i));
          }
          return [...items, { ...action.item, id: `li-${action.requestId}` }];
        });
        return { ...next, processedRequestIds: seen, events: appendEvent(state.events, action.event) };
      }
      case 'UPDATE_LIST_ITEM':
        return updateActiveList(state, (items) =>
          items.map((i) => (i.id === action.listItemId ? { ...i, ...action.patch } : i)),
        );
      case 'REMOVE_LIST_ITEM':
        return updateActiveList(state, (items) => items.filter((i) => i.id !== action.listItemId));
      case 'RESOLVE_LIST_ITEM': {
        const item = catalog.items.find((i) => i.id === action.itemId);
        if (!item) return state;
        return updateActiveList(state, (items) =>
          items.map((i) =>
            i.id === action.listItemId
              ? { ...i, itemId: item.id, text: item.name, unit: areComparable(i.unit, item.unit) ? i.unit : item.unit }
              : i,
          ),
        );
      }
      case 'CREATE_LIST':
        if (state.lists.some((l) => l.id === action.id)) return state;
        return {
          ...state,
          lists: [...state.lists, { id: action.id, name: action.name, revision: 1, items: [] }],
          activeListId: action.id,
        };
      case 'SET_ACTIVE_LIST':
        return state.lists.some((l) => l.id === action.listId) ? { ...state, activeListId: action.listId } : state;
      case 'ADD_PANTRY_ITEM': {
        if (state.processedRequestIds.includes(action.requestId)) return state;
        if (!catalog.items.some((i) => i.id === action.line.itemId)) return state;
        const { pantry } = applyPurchase(state.pantry, [action.line], now);
        const seen = [...state.processedRequestIds, action.requestId].slice(-MAX_REQUEST_IDS);
        return { ...state, pantry, processedRequestIds: seen };
      }
      case 'REMOVE_PANTRY_ITEM':
        return { ...state, pantry: state.pantry.filter((p) => p.id !== action.pantryId) };
      case 'SET_PANTRY_QUANTITY':
        return {
          ...state,
          pantry: state.pantry.map((p) => (p.id === action.pantryId ? setQuantity(p, action.quantity, now) : p)),
        };
      case 'COMPLETE_TRIP': {
        // Idempotent: the trip id is derived from the list revision, so a second tap is a no-op.
        if (state.trips.some((t) => t.id === action.trip.id)) return state;
        const { pantry } = applyPurchase(state.pantry, action.trip.lines, now);
        const bought = new Set(action.trip.lines.map((l) => l.itemId));
        const afterTrip = updateActiveList({ ...state, pantry, trips: [...state.trips, action.trip] }, (items) =>
          items.filter((i) => !i.itemId || !bought.has(i.itemId)),
        );
        return { ...afterTrip, events: appendEvent(state.events, action.event), reminder: reminderFor(afterTrip, catalog) };
      }
      case 'ADVANCE_CLOCK': {
        const advanced = { ...state, clock: advanceClock(state.clock, action.days) };
        return { ...advanced, reminder: reminderFor(advanced, catalog) };
      }
      case 'DISMISS_DISCOVERY':
        return {
          ...state,
          profiles: state.profiles.map((p) =>
            p.id === state.activeProfileId && !p.dismissedProductIds.includes(action.productId)
              ? { ...p, dismissedProductIds: [...p.dismissedProductIds, action.productId] }
              : p,
          ),
        };
      case 'SET_ZIP':
        return catalog.zips.some((z) => z.code === action.zip) ? { ...state, zip: action.zip } : state;
      case 'SET_PROFILE':
        return state.profiles.some((p) => p.id === action.profileId) ? { ...state, activeProfileId: action.profileId } : state;
      case 'LOG_EVENT':
        return { ...state, events: appendEvent(state.events, action.event) };
      case 'DISMISS_REMINDER':
        return { ...state, reminder: null };
      case 'REPLACE_STATE':
        return action.state;
    }
  };
}

export const reducer = makeReducer(CATALOG);
