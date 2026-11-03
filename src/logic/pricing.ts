import { daysBetween } from './clock';
import type { Product } from './types';
import { BASE_LABEL, toBase } from './units';

export const STALE_AFTER_DAYS = 7;

/**
 * The price that applies right now. A special counts only while `now` is before its end date;
 * an expired special falls back to the regular price. Returns null when the price is missing.
 */
export function activePrice(product: Product, now: Date): { cents: number; onSpecial: boolean } | null {
  if (product.special && Date.parse(product.special.endsAt) > now.getTime()) {
    return { cents: product.special.priceCents, onSpecial: true };
  }
  if (product.priceCents === null) return null;
  return { cents: product.priceCents, onSpecial: false };
}

export function isStale(product: Product, now: Date): boolean {
  return daysBetween(product.priceUpdatedAt, now) > STALE_AFTER_DAYS;
}

export function priceAgeDays(product: Product, now: Date): number {
  return Math.floor(daysBetween(product.priceUpdatedAt, now));
}

/** Cents per base unit (per fl oz, per oz or per item). */
export function unitPrice(product: Product, now: Date): { centsPerUnit: number; label: string } | null {
  const price = activePrice(product, now);
  if (!price) return null;
  const base = toBase(product.size, product.unit);
  return { centsPerUnit: price.cents / base.amount, label: BASE_LABEL[base.family] };
}
