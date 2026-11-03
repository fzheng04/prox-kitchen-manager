import type { CatalogItem, Product } from './types';

export type SearchResult = { item: CatalogItem; score: number };

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreItem(query: string, item: CatalogItem, brands: string[]): number {
  const name = normalize(item.name);
  if (name === query) return 100;
  if (name.startsWith(query)) return 80;
  if (name.split(' ').some((word) => word.startsWith(query))) return 60;
  if (item.terms.some((term) => normalize(term).startsWith(query))) return 40;
  if (brands.some((brand) => normalize(brand).startsWith(query))) return 20;
  if (name.includes(query)) return 10;
  return 0;
}

/**
 * Searches the local catalog as the user types. Ranking: exact name, name prefix, word prefix,
 * search term, brand, substring. Ties sort by name, then id, so results never reshuffle.
 */
export function searchCatalog(query: string, items: CatalogItem[], products: Product[]): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];
  const brandsByItem = new Map<string, string[]>();
  for (const p of products) {
    const list = brandsByItem.get(p.itemId) ?? [];
    if (!list.includes(p.brand)) list.push(p.brand);
    brandsByItem.set(p.itemId, list);
  }
  return items
    .map((item) => ({ item, score: scoreItem(q, item, brandsByItem.get(item.id) ?? []) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name) || a.item.id.localeCompare(b.item.id));
}

/** A query is ambiguous when two or more catalog items tie for the best score ("milk", "yogurt"). */
export function isAmbiguous(results: SearchResult[]): boolean {
  return results.length > 1 && results[0].score === results[1].score;
}

/** Products a retailer carries for a catalog item in a ZIP, with duplicate feed rows collapsed. */
export function productsFor(itemId: string, retailerId: string, zip: string, products: Product[]): Product[] {
  const matches = products.filter((p) => p.itemId === itemId && p.retailerId === retailerId && p.zips.includes(zip));
  return dedupeProducts(matches);
}

/**
 * The same physical product can appear twice in a feed. Rows with the same brand, size, unit and
 * organic flag are one product; keep the one with a price (cheapest first, then lowest id).
 */
export function dedupeProducts(products: Product[]): Product[] {
  const byKey = new Map<string, Product>();
  for (const p of products) {
    const key = [p.retailerId, p.itemId, p.brand, p.size, p.unit, p.organic].join('|');
    const existing = byKey.get(key);
    if (!existing || isBetterRow(p, existing)) byKey.set(key, p);
  }
  return [...byKey.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function isBetterRow(candidate: Product, current: Product): boolean {
  if (current.priceCents === null) return candidate.priceCents !== null || candidate.id < current.id;
  if (candidate.priceCents === null) return false;
  if (candidate.priceCents !== current.priceCents) return candidate.priceCents < current.priceCents;
  return candidate.id < current.id;
}
