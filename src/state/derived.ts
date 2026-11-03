import { useMemo } from 'react';

import { compareBaskets } from '@/logic/basket';
import { discoveryPick } from '@/logic/discovery';
import { restockSuggestions } from '@/logic/pantry';

import { useApp } from './app-state';

/** Hooks that run the pure logic against current app state. Screens stay presentation-only. */

export function useOnListItemIds(): string[] {
  const { list } = useApp();
  return useMemo(() => list.items.flatMap((i) => (i.itemId ? [i.itemId] : [])), [list.items]);
}

export function useRestockSuggestions() {
  const { state, profile, catalog, now } = useApp();
  const onListItemIds = useOnListItemIds();
  return useMemo(
    () => restockSuggestions({ pantry: state.pantry, history: state.trips, profile, catalog, onListItemIds, now }),
    [state.pantry, state.trips, profile, catalog, onListItemIds, now],
  );
}

export function useBaskets() {
  const { list, state, profile, catalog, now } = useApp();
  return useMemo(() => compareBaskets(list.items, state.zip, profile, catalog, now), [list.items, state.zip, profile, catalog, now]);
}

/** The user's store: where they shopped last, falling back to the first retailer in their ZIP. */
export function useHomeRetailerId(): string {
  const { state, catalog } = useApp();
  return useMemo(() => {
    const serving = catalog.retailers.filter((r) => r.zips.includes(state.zip));
    const last = [...state.trips]
      .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
      .find((t) => serving.some((r) => r.id === t.retailerId));
    return last?.retailerId ?? serving[0]?.id ?? catalog.retailers[0].id;
  }, [state.trips, state.zip, catalog]);
}

export function useDiscoveryPick() {
  const { state, profile, catalog, now } = useApp();
  const onListItemIds = useOnListItemIds();
  const retailerId = useHomeRetailerId();
  return useMemo(
    () =>
      discoveryPick({
        profile,
        catalog,
        zip: state.zip,
        retailerId,
        pantry: state.pantry,
        onListItemIds,
        history: state.trips,
        now,
      }),
    [profile, catalog, state.zip, retailerId, state.pantry, onListItemIds, state.trips, now],
  );
}
