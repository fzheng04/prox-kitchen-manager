import type { AnalyticsEvent } from '../logic/analytics';
import type { MockClock } from '../logic/clock';
import type { ListItem, PantryItem, Profile, ShoppingList, Trip, TripLine } from '../logic/types';

export type Reminder = { itemId: string; text: string; createdAt: string };

/** Everything that persists across launches. The catalog ships with the app and is not stored. */
export type AppState = {
  anonymousId: string;
  clock: MockClock;
  zip: string;
  activeProfileId: string;
  profiles: Profile[];
  pantry: PantryItem[];
  lists: ShoppingList[];
  activeListId: string;
  trips: Trip[];
  events: AnalyticsEvent[];
  /** Recent add requests, so a repeated tap with the same request id applies once. */
  processedRequestIds: string[];
  reminder: Reminder | null;
};

export type Action =
  | { type: 'ADD_LIST_ITEM'; requestId: string; item: Omit<ListItem, 'id'>; event: AnalyticsEvent }
  | { type: 'UPDATE_LIST_ITEM'; listItemId: string; patch: Partial<Omit<ListItem, 'id'>> }
  | { type: 'REMOVE_LIST_ITEM'; listItemId: string }
  | { type: 'RESOLVE_LIST_ITEM'; listItemId: string; itemId: string }
  | { type: 'CREATE_LIST'; id: string; name: string }
  | { type: 'SET_ACTIVE_LIST'; listId: string }
  | { type: 'ADD_PANTRY_ITEM'; requestId: string; line: TripLine }
  | { type: 'REMOVE_PANTRY_ITEM'; pantryId: string }
  | { type: 'SET_PANTRY_QUANTITY'; pantryId: string; quantity: number }
  | { type: 'COMPLETE_TRIP'; trip: Trip; event: AnalyticsEvent }
  | { type: 'ADVANCE_CLOCK'; days: number }
  | { type: 'DISMISS_DISCOVERY'; productId: string }
  | { type: 'SET_ZIP'; zip: string }
  | { type: 'SET_PROFILE'; profileId: string }
  | { type: 'LOG_EVENT'; event: AnalyticsEvent }
  | { type: 'DISMISS_REMINDER' }
  | { type: 'REPLACE_STATE'; state: AppState };
