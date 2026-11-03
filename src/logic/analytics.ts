export type EventName =
  | 'app_session_started'
  | 'list_item_added'
  | 'search_result_selected'
  | 'basket_compared'
  | 'retailer_handoff_tapped'
  | 'pantry_restock_suggested'
  | 'shopping_trip_completed';

export type AnalyticsEvent = {
  id: string;
  name: EventName;
  sessionId: string;
  anonymousId: string;
  /** Wall-clock time the event was recorded. */
  timestamp: string;
  /** Mock-clock time, so events line up with the simulated week. */
  mockTime: string;
  /** Events sharing a key are the same occurrence; only the first is stored. */
  dedupeKey: string;
  props: Record<string, string | number | boolean>;
};

export const MAX_EVENTS = 500;

/** Appends an event unless one with the same dedupe key exists. Keeps the newest MAX_EVENTS. */
export function appendEvent(log: AnalyticsEvent[], event: AnalyticsEvent): AnalyticsEvent[] {
  if (log.some((e) => e.dedupeKey === event.dedupeKey || e.id === event.id)) return log;
  const next = [...log, event];
  return next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
}
