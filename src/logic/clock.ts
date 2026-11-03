export const DAY_MS = 24 * 60 * 60 * 1000;

/** The mock clock is the seed's start time plus a whole number of days. */
export type MockClock = { startIso: string; offsetDays: number };

export function clockNow(clock: MockClock): Date {
  return new Date(Date.parse(clock.startIso) + clock.offsetDays * DAY_MS);
}

export function advanceClock(clock: MockClock, days: number): MockClock {
  return { ...clock, offsetDays: clock.offsetDays + days };
}

export function daysBetween(fromIso: string, to: Date): number {
  return (to.getTime() - Date.parse(fromIso)) / DAY_MS;
}

/** 1-based week number of the mock clock, used for the weekly summary and reminders. */
export function weekIndex(clock: MockClock): number {
  return Math.floor(clock.offsetDays / 7) + 1;
}

export function weekStart(clock: MockClock): Date {
  const startOffset = Math.floor(clock.offsetDays / 7) * 7;
  return new Date(Date.parse(clock.startIso) + startOffset * DAY_MS);
}

export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getUTCDay()]} ${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}
