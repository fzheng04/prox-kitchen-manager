import type { Unit, UnitFamily } from './types';

// Each unit maps to a family and a factor into that family's base unit
// (fl oz for volume, oz for weight, single items for count).
const UNITS: Record<Unit, { family: UnitFamily; toBase: number; label: string }> = {
  fl_oz: { family: 'volume', toBase: 1, label: 'fl oz' },
  qt: { family: 'volume', toBase: 32, label: 'qt' },
  gal: { family: 'volume', toBase: 128, label: 'gal' },
  ml: { family: 'volume', toBase: 1 / 29.5735, label: 'ml' },
  l: { family: 'volume', toBase: 1000 / 29.5735, label: 'L' },
  oz: { family: 'weight', toBase: 1, label: 'oz' },
  lb: { family: 'weight', toBase: 16, label: 'lb' },
  g: { family: 'weight', toBase: 1 / 28.3495, label: 'g' },
  kg: { family: 'weight', toBase: 1000 / 28.3495, label: 'kg' },
  ct: { family: 'count', toBase: 1, label: 'ct' },
  dozen: { family: 'count', toBase: 12, label: 'dozen' },
};

export const BASE_LABEL: Record<UnitFamily, string> = { volume: 'fl oz', weight: 'oz', count: 'item' };

export function unitFamily(unit: Unit): UnitFamily {
  return UNITS[unit].family;
}

export function unitLabel(unit: Unit): string {
  return UNITS[unit].label;
}

export function toBase(quantity: number, unit: Unit): { family: UnitFamily; amount: number } {
  const u = UNITS[unit];
  return { family: u.family, amount: quantity * u.toBase };
}

export function areComparable(a: Unit, b: Unit): boolean {
  return UNITS[a].family === UNITS[b].family;
}

/** Converts between compatible units. Returns null for weight ↔ volume and other mismatches. */
export function convert(quantity: number, from: Unit, to: Unit): number | null {
  if (!areComparable(from, to)) return null;
  return (quantity * UNITS[from].toBase) / UNITS[to].toBase;
}

/** Units the user can pick for a list item, in display order. */
export function unitsForFamily(family: UnitFamily): Unit[] {
  if (family === 'volume') return ['fl_oz', 'qt', 'gal'];
  if (family === 'weight') return ['oz', 'lb'];
  return ['ct', 'dozen'];
}

export const MAX_QUANTITY = 9999;

/**
 * Reads a quantity the user typed. Accepts "2", "1.5", ".5" and a decimal comma ("1,5").
 * Returns null for anything that isn't a plain non-negative number (blank, "abc", "-1", "1e3"),
 * so the caller can keep the previous value. Rounds to 2 decimals and clamps to [min, MAX_QUANTITY].
 */
export function parseQuantity(text: string, min = 0): number | null {
  const cleaned = text.trim().replace(',', '.');
  if (!/^(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
  const n = Math.round(Number(cleaned) * 100) / 100;
  return Math.min(MAX_QUANTITY, Math.max(min, n));
}

export function formatQuantity(quantity: number, unit: Unit): string {
  const rounded = Math.round(quantity * 10) / 10;
  return `${rounded} ${unitLabel(unit)}`;
}
