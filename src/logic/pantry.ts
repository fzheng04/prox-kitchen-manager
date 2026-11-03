import { DAY_MS, daysBetween, formatDate } from './clock';
import type { Catalog, CatalogItem, PantryItem, Product, Profile, Trip, TripLine, Unit } from './types';
import { convert, formatQuantity } from './units';

/** Stock left now, assuming steady use since the last measurement. Never below zero. */
export function currentQuantity(item: PantryItem, now: Date): number {
  const elapsed = Math.max(0, daysBetween(item.updatedAt, now));
  return Math.max(0, item.quantity - item.dailyUse * elapsed);
}

export function daysLeft(item: PantryItem, now: Date): number {
  if (item.dailyUse <= 0) return Infinity;
  return currentQuantity(item, now) / item.dailyUse;
}

export function isLow(item: PantryItem, now: Date): boolean {
  return currentQuantity(item, now) <= item.lowThreshold;
}

/** Re-measures an item at `now` so later edits start from the consumed quantity. */
export function snapshot(item: PantryItem, now: Date): PantryItem {
  return { ...item, quantity: round(currentQuantity(item, now)), updatedAt: now.toISOString() };
}

export function setQuantity(item: PantryItem, quantity: number, now: Date): PantryItem {
  return { ...item, quantity: Math.max(0, round(quantity)), updatedAt: now.toISOString() };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Adds purchased lines to the pantry. Units are converted into the pantry item's unit; a line
 * that can't be converted (weight vs volume) is skipped and reported instead of guessed.
 */
export function applyPurchase(
  pantry: PantryItem[],
  lines: TripLine[],
  now: Date,
): { pantry: PantryItem[]; skipped: TripLine[] } {
  const next = [...pantry];
  const skipped: TripLine[] = [];
  for (const line of lines) {
    const index = next.findIndex((p) => p.itemId === line.itemId);
    if (index === -1) {
      next.push({
        id: `pantry-${line.itemId}`,
        itemId: line.itemId,
        quantity: line.quantity,
        unit: line.unit,
        // No usage history yet: assume it lasts two weeks and flag it when a quarter is left.
        dailyUse: round(line.quantity / 14),
        lowThreshold: round(line.quantity / 4),
        updatedAt: now.toISOString(),
      });
      continue;
    }
    const existing = snapshot(next[index], now);
    const added = convert(line.quantity, line.unit, existing.unit);
    if (added === null) {
      skipped.push(line);
      continue;
    }
    next[index] = { ...existing, quantity: round(existing.quantity + added) };
  }
  return { pantry: next, skipped };
}

export type RestockReason = 'low_quantity' | 'expected_depletion' | 'purchase_recurrence' | 'saved_preference';

export type RestockSuggestion = {
  itemId: string;
  name: string;
  reasons: { kind: RestockReason; text: string }[];
  score: number;
  daysLeft: number;
  suggestedQuantity: number;
  suggestedUnit: Unit;
};

const WEIGHTS: Record<RestockReason, number> = {
  low_quantity: 3,
  expected_depletion: 2,
  purchase_recurrence: 2,
  saved_preference: 1,
};

export const REASON_LABEL: Record<RestockReason, string> = {
  low_quantity: 'Low quantity',
  expected_depletion: 'Running out',
  purchase_recurrence: 'Usual restock',
  saved_preference: 'Saved preference',
};

/** Average gap between purchases of an item, and when the next one is due. Needs 2+ purchases. */
export function purchaseRecurrence(itemId: string, history: Trip[]): { everyDays: number; lastAt: Date; dueAt: Date } | null {
  const dates = history
    .filter((t) => t.lines.some((l) => l.itemId === itemId))
    .map((t) => Date.parse(t.completedAt))
    .sort((a, b) => a - b);
  if (dates.length < 2) return null;
  const gaps = dates.slice(1).map((d, i) => d - dates[i]);
  const avg = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const last = dates[dates.length - 1];
  return { everyDays: Math.round(avg / DAY_MS), lastAt: new Date(last), dueAt: new Date(last + avg) };
}

/**
 * Pantry rows in display order: newest first, like a stack. New items are appended to the pantry
 * (see applyPurchase) and edits update entries in place, so changing a quantity, restocking an
 * item you already have, or advancing the clock never moves a row. Entries whose item isn't in
 * the catalog are left out.
 */
export function pantryRows(pantry: PantryItem[], items: CatalogItem[]): { pantry: PantryItem; item: CatalogItem }[] {
  return pantry
    .flatMap((p) => {
      const item = items.find((i) => i.id === p.itemId);
      return item ? [{ pantry: p, item }] : [];
    })
    .reverse();
}

/**
 * A sensible amount to start with when stocking an item by hand: what was bought last time, else
 * one package (the first listing by id, so it's deterministic), else one of the item's unit.
 */
export function typicalAmount(item: CatalogItem, products: Product[], history: Trip[]): { quantity: number; unit: Unit } {
  const last = lastPurchase(item.id, history);
  if (last) return { quantity: last.quantity, unit: last.unit };
  const [pkg] = products.filter((p) => p.itemId === item.id).sort((a, b) => a.id.localeCompare(b.id));
  return pkg ? { quantity: pkg.size, unit: pkg.unit } : { quantity: 1, unit: item.unit };
}

function lastPurchase(itemId: string, history: Trip[]): TripLine | undefined {
  const trips = [...history].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  for (const t of trips) {
    const line = t.lines.find((l) => l.itemId === itemId);
    if (line) return line;
  }
  return undefined;
}

/**
 * Personalized restock suggestions. Every suggestion carries at least one reason. Items already on
 * the active list are left out. Ranked by reason weight, then fewest days left, then name and id.
 */
export function restockSuggestions(args: {
  pantry: PantryItem[];
  history: Trip[];
  profile: Profile;
  catalog: Catalog;
  onListItemIds: string[];
  now: Date;
}): RestockSuggestion[] {
  const { pantry, history, profile, catalog, onListItemIds, now } = args;
  const candidates = new Set([...pantry.map((p) => p.itemId), ...profile.favoriteItemIds]);
  const out: RestockSuggestion[] = [];

  for (const itemId of candidates) {
    if (onListItemIds.includes(itemId)) continue;
    const item = catalog.items.find((i) => i.id === itemId);
    if (!item) continue;
    const stock = pantry.find((p) => p.itemId === itemId);
    const left = stock ? daysLeft(stock, now) : 0;
    const reasons: RestockSuggestion['reasons'] = [];

    if (stock && isLow(stock, now)) {
      reasons.push({
        kind: 'low_quantity',
        text: `Down to ${formatQuantity(currentQuantity(stock, now), stock.unit)}. You restock at ${formatQuantity(stock.lowThreshold, stock.unit)}.`,
      });
    } else if (stock && left <= 3) {
      reasons.push({ kind: 'expected_depletion', text: `Runs out in ~${Math.max(1, Math.round(left))} days at your usual pace.` });
    }
    const recurrence = purchaseRecurrence(itemId, history);
    if (recurrence && recurrence.dueAt.getTime() - now.getTime() <= DAY_MS) {
      reasons.push({
        kind: 'purchase_recurrence',
        text: `You buy this every ~${recurrence.everyDays} days. Last bought ${formatDate(recurrence.lastAt)}.`,
      });
    }
    if (profile.favoriteItemIds.includes(itemId) && (!stock || left <= 7)) {
      reasons.push({
        kind: 'saved_preference',
        text: !stock
          ? `A saved favorite that isn't in your pantry.`
          : left < 1
            ? `A saved favorite that has run out.`
            : `A saved favorite with ~${Math.round(left)} days left.`,
      });
    }
    if (reasons.length === 0) continue;

    const last = lastPurchase(itemId, history);
    out.push({
      itemId,
      name: item.name,
      reasons,
      score: reasons.reduce((s, r) => s + WEIGHTS[r.kind], 0),
      daysLeft: left,
      suggestedQuantity: last?.quantity ?? 1,
      suggestedUnit: last?.unit ?? item.unit,
    });
  }

  return out.sort(
    (a, b) => b.score - a.score || a.daysLeft - b.daysLeft || a.name.localeCompare(b.name) || a.itemId.localeCompare(b.itemId),
  );
}
