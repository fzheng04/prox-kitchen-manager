import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';

import type { AnalyticsEvent, EventName } from '@/logic/analytics';
import { savingsVersusPriciest, type Basket } from '@/logic/basket';
import { clockNow } from '@/logic/clock';
import type { ListItem, Profile, ShoppingList } from '@/logic/types';

import { CATALOG } from './catalog';
import { newId } from './ids';
import { loadState, saveState } from './persistence';
import { activeList, activeProfile, initialState, reducer, tripIdFor } from './reducer';
import { asyncStorageStore, type KeyValueStore } from './storage';
import type { Action, AppState } from './types';

type Status = 'loading' | 'ready';

type AppContextValue = {
  status: Status;
  state: AppState;
  now: Date;
  catalog: typeof CATALOG;
  profile: Profile;
  list: ShoppingList;
  sessionId: string;
  /** Shown when saved data couldn't be loaded and the app started from the seed. */
  loadError: string | null;
  saveError: string | null;
  retrySave: () => void;
  reloadFromStorage: () => void;
  /** Back to a first launch with the seeded sample data and a new anonymous id. */
  resetDemo: () => void;
  /** Replace pantry, lists and history with the seeded sample scenario. Keeps the anonymous id and event log. */
  loadSample: () => void;
  /** Empty pantry, one empty list, no trips. Keeps the anonymous id and event log. */
  startEmpty: () => void;
  dispatch: (action: Action) => void;
  makeEvent: (name: EventName, props?: AnalyticsEvent['props'], dedupeKey?: string) => AnalyticsEvent;
  logEvent: (name: EventName, props?: AnalyticsEvent['props'], dedupeKey?: string) => void;
  addListItem: (requestId: string, item: Omit<ListItem, 'id'>, source: 'search' | 'suggestion' | 'discovery' | 'typed') => void;
  completeTrip: (basket: Basket, baskets: Basket[]) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const PLACEHOLDER = initialState('pending');

export function AppStateProvider({ children, store = asyncStorageStore }: { children: ReactNode; store?: KeyValueStore }) {
  const [state, dispatch] = useReducer(reducer, PLACEHOLDER);
  const [status, setStatus] = useState<Status>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadCount, setLoadCount] = useState(0);
  const [sessionId] = useState(() => newId('session'));
  const saveChain = useRef(Promise.resolve());

  // Hydrate from storage on launch (and when the reviewer taps "Reload from storage").
  useEffect(() => {
    let live = true;
    loadState(store, () => newId('anon')).then((result) => {
      if (!live) return;
      dispatch({ type: 'REPLACE_STATE', state: result.state });
      setLoadError(result.status === 'recovered' ? result.error : null);
      setStatus('ready');
    });
    return () => {
      live = false;
    };
  }, [store, loadCount]);

  // Save after every change once hydrated. Writes are chained so they land in order.
  const persist = useCallback(
    (next: AppState) => {
      saveChain.current = saveChain.current
        .then(() => saveState(store, next))
        .then(() => setSaveError(null))
        .catch((e: unknown) => setSaveError(e instanceof Error ? e.message : String(e)));
    },
    [store],
  );
  useEffect(() => {
    if (status === 'ready') persist(state);
  }, [state, status, persist]);

  const now = useMemo(() => clockNow(state.clock), [state.clock]);

  const makeEvent = useCallback(
    (name: EventName, props: AnalyticsEvent['props'] = {}, dedupeKey?: string): AnalyticsEvent => {
      const id = newId('evt');
      return {
        id,
        name,
        sessionId,
        anonymousId: state.anonymousId,
        timestamp: new Date().toISOString(),
        mockTime: now.toISOString(),
        dedupeKey: dedupeKey ?? id,
        props,
      };
    },
    [sessionId, state.anonymousId, now],
  );

  const logEvent = useCallback(
    (name: EventName, props?: AnalyticsEvent['props'], dedupeKey?: string) =>
      dispatch({ type: 'LOG_EVENT', event: makeEvent(name, props, dedupeKey) }),
    [makeEvent],
  );

  // One session event per launch, keyed by session id so re-renders can't repeat it.
  useEffect(() => {
    if (status === 'ready') logEvent('app_session_started', {}, `session:${sessionId}`);
  }, [status, sessionId, logEvent]);

  const addListItem = useCallback<AppContextValue['addListItem']>(
    (requestId, item, source) =>
      dispatch({
        type: 'ADD_LIST_ITEM',
        requestId,
        item,
        event: makeEvent(
          'list_item_added',
          { itemId: item.itemId ?? 'unresolved', quantity: item.quantity, unit: item.unit, source },
          `add:${requestId}`,
        ),
      }),
    [makeEvent],
  );

  const completeTrip = useCallback<AppContextValue['completeTrip']>(
    (basket, baskets) => {
      const list = activeList(state);
      const tripId = tripIdFor(list);
      const lines = basket.lines.flatMap((line) => {
        const listItem = list.items.find((i) => i.id === line.listItemId);
        if (!line.chosen || !line.itemId || !listItem) return [];
        return [
          {
            itemId: line.itemId,
            quantity: listItem.quantity,
            unit: listItem.unit,
            productId: line.chosen.product.id,
            costCents: line.chosen.costCents,
          },
        ];
      });
      dispatch({
        type: 'COMPLETE_TRIP',
        trip: {
          id: tripId,
          retailerId: basket.retailer.id,
          completedAt: now.toISOString(),
          lines,
          totalCents: basket.totalCents,
          savingsCents: savingsVersusPriciest(basket, baskets),
          source: 'app',
          listId: list.id,
        },
        event: makeEvent(
          'shopping_trip_completed',
          { tripId, retailerId: basket.retailer.id, items: lines.length, totalCents: basket.totalCents },
          `trip:${tripId}`,
        ),
      });
    },
    [state, now, makeEvent],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      status,
      state,
      now,
      catalog: CATALOG,
      profile: activeProfile(state),
      list: activeList(state),
      sessionId,
      loadError,
      saveError,
      retrySave: () => persist(state),
      reloadFromStorage: () => {
        setStatus('loading');
        setLoadCount((n) => n + 1);
      },
      resetDemo: () => dispatch({ type: 'REPLACE_STATE', state: initialState(newId('anon')) }),
      loadSample: () =>
        dispatch({ type: 'REPLACE_STATE', state: { ...initialState(state.anonymousId, 'sample'), events: state.events } }),
      startEmpty: () =>
        dispatch({ type: 'REPLACE_STATE', state: { ...initialState(state.anonymousId, 'fresh'), events: state.events } }),
      dispatch,
      makeEvent,
      logEvent,
      addListItem,
      completeTrip,
    }),
    [status, state, now, sessionId, loadError, saveError, persist, makeEvent, logEvent, addListItem, completeTrip],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppStateProvider');
  return ctx;
}
