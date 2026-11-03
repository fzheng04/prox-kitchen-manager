import { productsFor } from './matching';
import { formatCents } from './money';
import { activePrice } from './pricing';
import type { Catalog, CatalogItem, PantryItem, Product, Profile, Trip } from './types';

export type DiscoveryPick = { product: Product; item: CatalogItem; priceCents: number; reasons: string[]; score: number };

/** Each earlier dismissal in a category lowers new picks from that category by this much. */
export const DISMISSAL_PENALTY = 25;

/**
 * One optional "Try something new" pick. Constraints, all required:
 * - the item's category is one the profile asked to discover,
 * - organic when the profile prefers organic for that category,
 * - stocked with a current price at the user's store in their ZIP,
 * - not in the pantry, not on the list, never bought, not dismissed.
 * Ranking uses no paid placement: past dismissals in a category push it down, then price, then id.
 */
export function discoveryPick(args: {
  profile: Profile;
  catalog: Catalog;
  zip: string;
  retailerId: string;
  pantry: PantryItem[];
  onListItemIds: string[];
  history: Trip[];
  now: Date;
}): DiscoveryPick | null {
  const { profile, catalog, zip, retailerId, pantry, onListItemIds, history, now } = args;
  const retailer = catalog.retailers.find((r) => r.id === retailerId);
  if (!retailer) return null;
  const owned = new Set([
    ...pantry.map((p) => p.itemId),
    ...onListItemIds,
    ...history.flatMap((t) => t.lines.map((l) => l.itemId)),
  ]);
  const dismissedCategories = profile.dismissedProductIds
    .map((id) => catalog.products.find((p) => p.id === id)?.itemId)
    .map((itemId) => catalog.items.find((i) => i.id === itemId)?.category)
    .filter((c): c is CatalogItem['category'] => c !== undefined);

  const picks: DiscoveryPick[] = [];
  for (const item of catalog.items) {
    if (!profile.discoverCategories.includes(item.category) || owned.has(item.id)) continue;
    const wantsOrganic = profile.organicCategories.includes(item.category);
    for (const product of productsFor(item.id, retailerId, zip, catalog.products)) {
      if (profile.dismissedProductIds.includes(product.id)) continue;
      if (wantsOrganic && !product.organic) continue;
      const price = activePrice(product, now);
      if (!price) continue;
      const penalty = dismissedCategories.filter((c) => c === item.category).length * DISMISSAL_PENALTY;
      const reasons = [
        `You asked to discover new ${item.category} items.`,
        wantsOrganic ? `Organic, matching your ${item.category} preference.` : `Fits your saved preferences.`,
        `In stock at ${retailer.name} for ${formatCents(price.cents)}.`,
        `You haven't bought ${item.name.toLowerCase()} before.`,
      ];
      picks.push({ product, item, priceCents: price.cents, reasons, score: 100 - penalty });
    }
  }
  picks.sort((a, b) => b.score - a.score || a.priceCents - b.priceCents || a.product.id.localeCompare(b.product.id));
  return picks[0] ?? null;
}
