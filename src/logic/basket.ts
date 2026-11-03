import { productsFor } from './matching';
import { activePrice, isStale, priceAgeDays, unitPrice } from './pricing';
import type { Catalog, ListItem, Product, Profile, Retailer } from './types';
import { areComparable, formatQuantity, toBase, unitLabel } from './units';
import { formatCents } from './money';

export type LineStatus = 'matched' | 'substituted' | 'missing' | 'no_price' | 'not_comparable' | 'unresolved';

export type PricedOption = { product: Product; packages: number; costCents: number; centsPerUnit: number; unitLabel: string };

export type BasketLine = {
  listItemId: string;
  itemId: string | null;
  name: string;
  status: LineStatus;
  chosen?: PricedOption;
  stale: boolean;
  onSpecial: boolean;
  /** A cheaper product the user's preference ruled out. Shown, never swapped in automatically. */
  alternative?: PricedOption & { savingsCents: number };
  note: string;
};

export type Basket = {
  retailer: Retailer;
  lines: BasketLine[];
  /** Sum of priced lines only. Missing prices are never counted as $0; they make the basket incomplete. */
  totalCents: number;
  matchedCount: number;
  itemCount: number;
  missing: BasketLine[];
  staleCount: number;
  complete: boolean;
  isBestDeal: boolean;
  /** True when this basket costs less than the best complete one only because items are missing. */
  cheaperButIncomplete: boolean;
};

export type Preference = { brand?: string; organic: boolean };

export function preferenceFor(listItem: ListItem, profile: Profile, catalog: Catalog): Preference {
  const item = catalog.items.find((i) => i.id === listItem.itemId);
  const brand = listItem.pinnedBrand ?? (listItem.itemId ? profile.pinnedBrands[listItem.itemId] : undefined);
  const organic = listItem.organic ?? (item ? profile.organicCategories.includes(item.category) : false);
  return { brand, organic };
}

function priceOption(product: Product, listItem: ListItem, now: Date): PricedOption | null {
  const price = activePrice(product, now);
  const unit = unitPrice(product, now);
  if (!price || !unit) return null;
  const need = toBase(listItem.quantity, listItem.unit).amount;
  const size = toBase(product.size, product.unit).amount;
  // Small epsilon so 1 gal vs 128 fl oz is exactly one package despite float rounding.
  const packages = Math.max(1, Math.ceil(need / size - 1e-9));
  return { product, packages, costCents: packages * price.cents, centsPerUnit: unit.centsPerUnit, unitLabel: unit.label };
}

function byCost(a: PricedOption, b: PricedOption): number {
  return a.costCents - b.costCents || a.centsPerUnit - b.centsPerUnit || a.product.id.localeCompare(b.product.id);
}

function packageNote(option: PricedOption, listItem: ListItem): string {
  const pack = formatQuantity(option.product.size, option.product.unit);
  if (option.packages === 1 && option.product.unit === listItem.unit && option.product.size === listItem.quantity) return '';
  return `${option.packages} × ${pack} covers ${formatQuantity(listItem.quantity, listItem.unit)}.`;
}

export function priceLine(
  listItem: ListItem,
  retailer: Retailer,
  zip: string,
  preference: Preference,
  catalog: Catalog,
  now: Date,
): BasketLine {
  const name = catalog.items.find((i) => i.id === listItem.itemId)?.name ?? listItem.text;
  const base = { listItemId: listItem.id, itemId: listItem.itemId, name, stale: false, onSpecial: false };
  if (!listItem.itemId) {
    return { ...base, status: 'unresolved', note: `"${listItem.text}" needs a match before it can be priced.` };
  }
  const stocked = productsFor(listItem.itemId, retailer.id, zip, catalog.products);
  if (stocked.length === 0) {
    return { ...base, status: 'missing', note: `${retailer.name} doesn't carry this in ${zip}.` };
  }
  const comparable = stocked.filter((p) => areComparable(p.unit, listItem.unit));
  if (comparable.length === 0) {
    const sold = unitLabel(stocked[0].unit);
    return {
      ...base,
      status: 'not_comparable',
      note: `Sold in ${sold} here, which can't be compared with ${unitLabel(listItem.unit)}.`,
    };
  }
  const priced = comparable
    .map((p) => priceOption(p, listItem, now))
    .filter((o): o is PricedOption => o !== null)
    .sort(byCost);
  if (priced.length === 0) {
    return { ...base, status: 'no_price', note: `${retailer.name} has no current price for this.` };
  }

  const fits = (o: PricedOption) =>
    (!preference.brand || o.product.brand === preference.brand) && (!preference.organic || o.product.organic);
  const preferred = priced.filter(fits);
  const cheapest = priced[0];
  const chosen = preferred[0] ?? cheapest;
  const flags = { stale: isStale(chosen.product, now), onSpecial: activePrice(chosen.product, now)?.onSpecial ?? false };
  const notes: string[] = [];

  let status: LineStatus = 'matched';
  if (preferred.length === 0 && (preference.brand || preference.organic)) {
    status = 'substituted';
    const wanted = preference.brand ? preference.brand : 'An organic option';
    notes.push(`${wanted} isn't sold here, so this uses ${chosen.product.brand}, the cheapest match.`);
  }
  let alternative: BasketLine['alternative'];
  if (chosen !== cheapest && cheapest.costCents < chosen.costCents) {
    const savingsCents = chosen.costCents - cheapest.costCents;
    alternative = { ...cheapest, savingsCents };
    const why = preference.brand ? `you pinned ${preference.brand}` : 'you prefer organic';
    notes.push(`${cheapest.product.brand} would save ${formatCents(savingsCents)}. Kept ${chosen.product.brand} because ${why}.`);
  }
  const pack = packageNote(chosen, listItem);
  if (pack) notes.push(pack);
  if (flags.stale) notes.push(`Price is ${priceAgeDays(chosen.product, now)} days old.`);
  if (flags.onSpecial) notes.push('On special this week.');

  return { ...base, ...flags, status, chosen, alternative, note: notes.join(' ') };
}

/**
 * Builds one basket per retailer serving the ZIP and ranks them. Complete baskets come first,
 * cheapest first. Incomplete baskets follow, most coverage first. Ties break on retailer id.
 * Only the cheapest complete basket can be the best deal.
 */
export function compareBaskets(
  items: ListItem[],
  zip: string,
  profile: Profile,
  catalog: Catalog,
  now: Date,
): Basket[] {
  const retailers = catalog.retailers.filter((r) => r.zips.includes(zip));
  const baskets = retailers.map((retailer) => {
    const lines = items.map((li) => priceLine(li, retailer, zip, preferenceFor(li, profile, catalog), catalog, now));
    const priced = lines.filter((l) => l.status === 'matched' || l.status === 'substituted');
    const missing = lines.filter((l) => !(l.status === 'matched' || l.status === 'substituted'));
    return {
      retailer,
      lines,
      totalCents: priced.reduce((sum, l) => sum + (l.chosen?.costCents ?? 0), 0),
      matchedCount: priced.length,
      itemCount: lines.length,
      missing,
      staleCount: lines.filter((l) => l.stale).length,
      complete: lines.length > 0 && missing.length === 0,
      isBestDeal: false,
      cheaperButIncomplete: false,
    };
  });

  baskets.sort((a, b) => {
    if (a.complete !== b.complete) return a.complete ? -1 : 1;
    if (!a.complete && a.matchedCount !== b.matchedCount) return b.matchedCount - a.matchedCount;
    return a.totalCents - b.totalCents || a.retailer.id.localeCompare(b.retailer.id);
  });

  const best = baskets.find((b) => b.complete);
  return baskets.map((b) => ({
    ...b,
    isBestDeal: b === best,
    cheaperButIncomplete: !b.complete && best !== undefined && b.totalCents < best.totalCents,
  }));
}

/** Savings of the chosen basket against the most expensive complete basket (0 if none to compare). */
export function savingsVersusPriciest(chosen: Basket, baskets: Basket[]): number {
  if (!chosen.complete) return 0;
  const complete = baskets.filter((b) => b.complete);
  if (complete.length < 2) return 0;
  return Math.max(...complete.map((b) => b.totalCents)) - chosen.totalCents;
}
