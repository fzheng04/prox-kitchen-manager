import { DAY_MS } from './clock';
import type { Trip } from './types';

export type WeekSummary = { trips: number; spentCents: number; savedCents: number };

/** Totals for trips completed in [weekStart, weekStart + 7 days). */
export function weekSummary(trips: Trip[], weekStart: Date): WeekSummary {
  const from = weekStart.getTime();
  const to = from + 7 * DAY_MS;
  const inWeek = trips.filter((t) => {
    const at = Date.parse(t.completedAt);
    return at >= from && at < to;
  });
  return {
    trips: inWeek.length,
    spentCents: inWeek.reduce((s, t) => s + t.totalCents, 0),
    savedCents: inWeek.reduce((s, t) => s + t.savingsCents, 0),
  };
}

export function totalSaved(trips: Trip[]): number {
  return trips.reduce((s, t) => s + t.savingsCents, 0);
}
