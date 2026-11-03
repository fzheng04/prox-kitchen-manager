// Domain types shared by logic, state and UI. Record formats are documented in fixtures/README.md.

export type Unit = 'fl_oz' | 'qt' | 'gal' | 'ml' | 'l' | 'oz' | 'lb' | 'g' | 'kg' | 'ct' | 'dozen';
export type UnitFamily = 'volume' | 'weight' | 'count';
export type Category = 'produce' | 'dairy' | 'meat' | 'pantry' | 'essentials' | 'frozen';

export type Zip = { code: string; label: string };

export type Retailer = { id: string; name: string; short: string; priceFactor: number; zips: string[] };

/** A canonical catalog item ("Whole milk"), independent of retailer or brand. */
export type CatalogItem = { id: string; name: string; category: Category; unit: Unit; terms: string[] };

/** A retailer's listing for a catalog item. `priceCents: null` means the price feed is missing. */
export type Product = {
  id: string;
  retailerId: string;
  itemId: string;
  brand: string;
  name: string;
  size: number;
  unit: Unit;
  organic: boolean;
  priceCents: number | null;
  priceUpdatedAt: string;
  zips: string[];
  special?: { priceCents: number; endsAt: string };
};

export type PantryItem = {
  id: string;
  itemId: string;
  /** Quantity measured at `updatedAt`. Current stock is derived with `dailyUse`. */
  quantity: number;
  unit: Unit;
  dailyUse: number;
  lowThreshold: number;
  updatedAt: string;
};

export type ListItem = {
  id: string;
  /** null until the user resolves an ambiguous entry ("milk") to a catalog item. */
  itemId: string | null;
  text: string;
  quantity: number;
  unit: Unit;
  pinnedBrand?: string;
  organic?: boolean;
};

export type ShoppingList = { id: string; name: string; revision: number; items: ListItem[] };

export type Profile = {
  id: string;
  name: string;
  organicCategories: Category[];
  pinnedBrands: Record<string, string>;
  favoriteItemIds: string[];
  discoverCategories: Category[];
  dismissedProductIds: string[];
};

export type TripLine = { itemId: string; quantity: number; unit: Unit; productId?: string; costCents?: number };

export type Trip = {
  id: string;
  retailerId: string;
  completedAt: string;
  lines: TripLine[];
  totalCents: number;
  savingsCents: number;
  source: 'seed' | 'app';
  listId?: string;
};

export type Seed = {
  version: number;
  seedNow: string;
  zips: Zip[];
  retailers: Retailer[];
  items: CatalogItem[];
  products: Product[];
  pantry: PantryItem[];
  lists: ShoppingList[];
  profiles: Profile[];
  history: Trip[];
};

/** Static, read-only data the logic needs. Not persisted (it ships with the app). */
export type Catalog = Pick<Seed, 'zips' | 'retailers' | 'items' | 'products'>;
