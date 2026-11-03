#!/usr/bin/env node
/**
 * Deterministic seed generator. Writes fixtures/seed.json.
 *
 *   node scripts/generate-seed.js
 *
 * Everything here is synthetic: retailer names, brands, prices and ZIP labels are made up.
 * Running the script twice produces byte-identical output (no randomness, no clock reads).
 * Record formats are documented in fixtures/README.md.
 */
const fs = require('fs');
const path = require('path');

const SEED_NOW = '2026-01-05T09:00:00.000Z'; // Monday, week 1 of the mock clock
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.parse(SEED_NOW) - n * DAY).toISOString();
const daysFromNow = (n) => new Date(Date.parse(SEED_NOW) + n * DAY).toISOString();

const zips = [
  { code: '94110', label: 'Mission (synthetic)' },
  { code: '94612', label: 'Uptown (synthetic)' },
];

const retailers = [
  { id: 'freshco', name: 'FreshCo Market', short: 'FC', priceFactor: 1.0, zips: ['94110', '94612'] },
  { id: 'valuemart', name: 'ValueMart', short: 'VM', priceFactor: 0.88, zips: ['94110', '94612'] },
  { id: 'greenleaf', name: 'Greenleaf Grocer', short: 'GG', priceFactor: 1.12, zips: ['94110', '94612'] },
];

// Canonical catalog items. `unit` is the default list/pantry unit.
const items = [
  { id: 'bananas', name: 'Bananas', category: 'produce', unit: 'ct', terms: ['banana', 'fruit'] },
  { id: 'spinach', name: 'Baby spinach', category: 'produce', unit: 'oz', terms: ['spinach', 'greens', 'salad'] },
  { id: 'apples', name: 'Gala apples', category: 'produce', unit: 'lb', terms: ['apple', 'fruit'] },
  { id: 'avocados', name: 'Avocados', category: 'produce', unit: 'ct', terms: ['avocado'] },
  { id: 'tomatoes', name: 'Roma tomatoes', category: 'produce', unit: 'lb', terms: ['tomato'] },
  { id: 'whole-milk', name: 'Whole milk', category: 'dairy', unit: 'gal', terms: ['milk', 'dairy'] },
  { id: 'oat-milk', name: 'Oat milk', category: 'dairy', unit: 'fl_oz', terms: ['milk', 'oat', 'plant'] },
  { id: 'almond-milk', name: 'Almond milk', category: 'dairy', unit: 'fl_oz', terms: ['milk', 'almond', 'plant'] },
  { id: 'eggs', name: 'Large eggs', category: 'dairy', unit: 'ct', terms: ['egg'] },
  { id: 'greek-yogurt', name: 'Greek yogurt', category: 'dairy', unit: 'oz', terms: ['yogurt'] },
  { id: 'plain-yogurt', name: 'Plain yogurt', category: 'dairy', unit: 'oz', terms: ['yogurt'] },
  { id: 'cheddar', name: 'Sharp cheddar', category: 'dairy', unit: 'oz', terms: ['cheese', 'cheddar'] },
  { id: 'butter', name: 'Salted butter', category: 'dairy', unit: 'oz', terms: ['butter'] },
  { id: 'chicken', name: 'Chicken breast', category: 'meat', unit: 'lb', terms: ['chicken', 'poultry'] },
  { id: 'ground-beef', name: 'Ground beef', category: 'meat', unit: 'lb', terms: ['beef', 'mince'] },
  { id: 'rice', name: 'Jasmine rice', category: 'pantry', unit: 'lb', terms: ['rice', 'grain'] },
  { id: 'pasta', name: 'Spaghetti', category: 'pantry', unit: 'oz', terms: ['pasta', 'noodles'] },
  { id: 'olive-oil', name: 'Olive oil', category: 'pantry', unit: 'fl_oz', terms: ['oil'] },
  { id: 'peanut-butter', name: 'Peanut butter', category: 'pantry', unit: 'oz', terms: ['nut butter', 'spread'] },
  { id: 'oats', name: 'Rolled oats', category: 'pantry', unit: 'oz', terms: ['oatmeal', 'oat', 'cereal'] },
  { id: 'honey', name: 'Honey', category: 'pantry', unit: 'oz', terms: ['sweetener'] },
  { id: 'coffee', name: 'Ground coffee', category: 'pantry', unit: 'oz', terms: ['coffee'] },
  { id: 'bread', name: 'Sandwich bread', category: 'pantry', unit: 'ct', terms: ['loaf', 'bread'] },
  { id: 'paper-towels', name: 'Paper towels', category: 'essentials', unit: 'ct', terms: ['towel', 'paper'] },
  { id: 'dish-soap', name: 'Dish soap', category: 'essentials', unit: 'fl_oz', terms: ['soap', 'detergent'] },
  { id: 'frozen-peas', name: 'Frozen peas', category: 'frozen', unit: 'oz', terms: ['peas', 'vegetables'] },
  { id: 'frozen-berries', name: 'Frozen mixed berries', category: 'frozen', unit: 'oz', terms: ['berries', 'fruit'] },
];

// Base listing per item: brand, package size, base price (cents), organic flag.
// Some items carry a second variant (organic or a named brand) to exercise preferences.
const base = {
  bananas: [{ brand: 'Field Day', size: 1, unit: 'ct', price: 29 }],
  spinach: [
    { brand: 'Field Day', size: 5, unit: 'oz', price: 349 },
    { brand: 'Sunrow', size: 5, unit: 'oz', price: 449, organic: true },
  ],
  apples: [{ brand: 'Field Day', size: 3, unit: 'lb', price: 499 }],
  avocados: [{ brand: 'Field Day', size: 4, unit: 'ct', price: 499 }],
  tomatoes: [{ brand: 'Field Day', size: 1, unit: 'lb', price: 229 }],
  'whole-milk': [
    { brand: 'Meadow Hill', size: 1, unit: 'gal', price: 479 },
    { brand: 'Sunrow', size: 0.5, unit: 'gal', price: 429, organic: true },
  ],
  'oat-milk': [{ brand: 'Rolling Oat', size: 64, unit: 'fl_oz', price: 449 }],
  'almond-milk': [{ brand: 'Grove', size: 64, unit: 'fl_oz', price: 389 }],
  eggs: [
    { brand: 'Meadow Hill', size: 12, unit: 'ct', price: 399 },
    { brand: 'Sunrow', size: 12, unit: 'ct', price: 599, organic: true },
  ],
  'greek-yogurt': [{ brand: 'Kalos', size: 32, unit: 'oz', price: 599 }],
  'plain-yogurt': [{ brand: 'Meadow Hill', size: 32, unit: 'oz', price: 379 }],
  cheddar: [{ brand: 'Meadow Hill', size: 8, unit: 'oz', price: 449 }],
  butter: [{ brand: 'Meadow Hill', size: 16, unit: 'oz', price: 549 }],
  chicken: [{ brand: 'Ridgeway', size: 2, unit: 'lb', price: 899 }],
  'ground-beef': [{ brand: 'Ridgeway', size: 1, unit: 'lb', price: 649 }],
  rice: [{ brand: 'Lotus Bay', size: 5, unit: 'lb', price: 799 }],
  pasta: [{ brand: 'Nonna Lu', size: 16, unit: 'oz', price: 199 }],
  'olive-oil': [{ brand: 'Costa Verde', size: 16.9, unit: 'fl_oz', price: 899 }],
  'peanut-butter': [
    { brand: 'Value Pick', size: 16, unit: 'oz', price: 299 },
    { brand: 'Hillside', size: 16, unit: 'oz', price: 449 },
  ],
  oats: [{ brand: 'Lotus Bay', size: 42, unit: 'oz', price: 499 }],
  honey: [{ brand: 'Bee Line', size: 12, unit: 'oz', price: 699 }],
  coffee: [{ brand: 'Night Owl', size: 12, unit: 'oz', price: 999 }],
  bread: [{ brand: 'Hearth', size: 1, unit: 'ct', price: 399 }],
  'paper-towels': [{ brand: 'Tidy', size: 6, unit: 'ct', price: 899 }],
  'dish-soap': [{ brand: 'Tidy', size: 24, unit: 'fl_oz', price: 349 }],
  'frozen-peas': [{ brand: 'Polar', size: 16, unit: 'oz', price: 229 }],
  'frozen-berries': [
    { brand: 'Polar', size: 32, unit: 'oz', price: 799 },
    { brand: 'Sunrow', size: 32, unit: 'oz', price: 999, organic: true },
  ],
};

// Deliberate edge cases, keyed by `${retailerId}:${itemId}`.
const omit = new Set([
  'valuemart:avocados', // missing item → incomplete (but cheaper) basket
  'valuemart:coffee',
  'greenleaf:oat-milk',
  'valuemart:greek-yogurt',
]);
const overrides = {
  // Same base amount, different packaging: 1 gal at FreshCo vs 128 fl oz at ValueMart.
  'valuemart:whole-milk:0': { size: 128, unit: 'fl_oz' },
  // Greenleaf only sells half-gallons of conventional milk → 2 packages per gallon.
  'greenleaf:whole-milk:0': { size: 64, unit: 'fl_oz', price: 279 },
  // Listing exists but the price feed is missing.
  'valuemart:olive-oil:0': { price: null },
  // Expired special: must not be used as the active price.
  'freshco:eggs:0': { special: { price: 249, endsAt: daysAgo(1) } },
  // Active special.
  'freshco:pasta:0': { special: { price: 129, endsAt: daysFromNow(4) } },
  // Honey sold by volume at Greenleaf → not comparable with an oz (weight) list item.
  'greenleaf:honey:0': { size: 12, unit: 'fl_oz' },
  // Bigger bag at ValueMart.
  'valuemart:rice:0': { size: 10, unit: 'lb', price: 1399 },
};
// Stale prices (older than 7 days on the mock clock) — kept, but flagged.
const staleAt = {
  'greenleaf:rice:0': 12,
  'greenleaf:coffee:0': 9,
  'valuemart:chicken:0': 10,
  'freshco:frozen-berries:1': 15,
};
// Only available in the first ZIP.
const zipLimited = new Set(['greenleaf:chicken:0', 'greenleaf:ground-beef:0', 'freshco:avocados:0']);

const products = [];
for (const r of retailers) {
  for (const item of items) {
    if (omit.has(`${r.id}:${item.id}`)) continue;
    base[item.id].forEach((variant, i) => {
      const key = `${r.id}:${item.id}:${i}`;
      const o = overrides[key] || {};
      const price =
        o.price === null ? null : o.price !== undefined ? o.price : Math.round(variant.price * r.priceFactor);
      const p = {
        id: `${r.id}-${item.id}-${i + 1}`,
        retailerId: r.id,
        itemId: item.id,
        brand: variant.brand,
        name: `${variant.brand} ${item.name.toLowerCase()}`,
        size: o.size !== undefined ? o.size : variant.size,
        unit: o.unit || variant.unit,
        organic: Boolean(variant.organic),
        priceCents: price,
        priceUpdatedAt: daysAgo(staleAt[key] !== undefined ? staleAt[key] : 1),
        zips: zipLimited.has(key) ? ['94110'] : r.zips,
      };
      if (o.special) p.special = { priceCents: o.special.price, endsAt: o.special.endsAt };
      products.push(p);
    });
  }
}
// A duplicate feed row: same product listed twice by FreshCo at different prices.
products.push({
  id: 'freshco-bananas-dup',
  retailerId: 'freshco',
  itemId: 'bananas',
  brand: 'Field Day',
  name: 'Field Day bananas',
  size: 1,
  unit: 'ct',
  organic: false,
  priceCents: 33,
  priceUpdatedAt: daysAgo(2),
  zips: ['94110', '94612'],
});

// Pantry: quantity is measured at `updatedAt`; `dailyUse` is in the same unit.
const pantry = [
  ['eggs', 3, 'ct', 1.5, 4],
  ['whole-milk', 0.3, 'gal', 0.12, 0.25],
  ['bananas', 2, 'ct', 1, 2],
  ['spinach', 4, 'oz', 0.8, 2],
  ['rice', 3, 'lb', 0.25, 1],
  ['pasta', 20, 'oz', 1.5, 8],
  ['olive-oil', 10, 'fl_oz', 0.4, 4],
  ['peanut-butter', 9, 'oz', 0.9, 4],
  ['oats', 30, 'oz', 1.5, 10],
  ['coffee', 7, 'oz', 0.6, 3],
  ['bread', 1, 'ct', 0.15, 0.5],
  ['butter', 12, 'oz', 0.5, 4],
  ['cheddar', 6, 'oz', 0.6, 2],
  ['paper-towels', 3, 'ct', 0.2, 1],
  ['frozen-peas', 16, 'oz', 0.5, 6],
].map(([itemId, quantity, unit, dailyUse, lowThreshold]) => ({
  id: `pantry-${itemId}`,
  itemId,
  quantity,
  unit,
  dailyUse,
  lowThreshold,
  updatedAt: SEED_NOW,
}));

const lists = [
  {
    id: 'list-weekly',
    name: 'Weekly staples',
    revision: 1,
    items: [
      { id: 'li-weekly-1', itemId: 'whole-milk', text: 'Whole milk', quantity: 1, unit: 'gal' },
      { id: 'li-weekly-2', itemId: 'eggs', text: 'Large eggs', quantity: 12, unit: 'ct' },
      { id: 'li-weekly-3', itemId: 'bananas', text: 'Bananas', quantity: 6, unit: 'ct' },
      { id: 'li-weekly-4', itemId: 'peanut-butter', text: 'Peanut butter', quantity: 16, unit: 'oz', pinnedBrand: 'Hillside' },
    ],
  },
  {
    id: 'list-tacos',
    name: 'Taco night',
    revision: 1,
    items: [
      { id: 'li-tacos-1', itemId: 'ground-beef', text: 'Ground beef', quantity: 2, unit: 'lb' },
      { id: 'li-tacos-2', itemId: 'avocados', text: 'Avocados', quantity: 4, unit: 'ct' },
      { id: 'li-tacos-3', itemId: 'tomatoes', text: 'Roma tomatoes', quantity: 1, unit: 'lb' },
      { id: 'li-tacos-4', itemId: 'cheddar', text: 'Sharp cheddar', quantity: 8, unit: 'oz' },
    ],
  },
  {
    id: 'list-breakfast',
    name: 'Breakfast restock',
    revision: 1,
    items: [
      { id: 'li-bfast-1', itemId: null, text: 'milk', quantity: 64, unit: 'fl_oz' },
      { id: 'li-bfast-2', itemId: 'oats', text: 'Rolled oats', quantity: 42, unit: 'oz' },
      { id: 'li-bfast-3', itemId: 'honey', text: 'Honey', quantity: 12, unit: 'oz' },
      { id: 'li-bfast-4', itemId: null, text: 'yogurt', quantity: 32, unit: 'oz' },
    ],
  },
];

const profiles = [
  {
    id: 'profile-organic',
    name: 'Organic-first household',
    organicCategories: ['produce', 'dairy'],
    pinnedBrands: { 'peanut-butter': 'Hillside' },
    favoriteItemIds: ['coffee', 'spinach'],
    discoverCategories: ['dairy', 'frozen'],
    dismissedProductIds: [],
  },
  {
    id: 'profile-budget',
    name: 'Budget-first household',
    organicCategories: [],
    pinnedBrands: {},
    favoriteItemIds: ['rice', 'pasta'],
    discoverCategories: ['pantry', 'produce'],
    dismissedProductIds: [],
  },
];

// Six historical trips. Milk + bananas recur weekly, coffee every two weeks, rice monthly.
const trip = (id, ago, retailerId, lines, totalCents, savingsCents) => ({
  id,
  retailerId,
  completedAt: daysAgo(ago),
  lines: lines.map(([itemId, quantity, unit]) => ({ itemId, quantity, unit })),
  totalCents,
  savingsCents,
  source: 'seed',
});
const history = [
  trip('trip-seed-1', 35, 'valuemart', [['rice', 10, 'lb'], ['whole-milk', 1, 'gal'], ['bananas', 6, 'ct']], 2161, 240),
  trip('trip-seed-2', 28, 'freshco', [['whole-milk', 1, 'gal'], ['bananas', 6, 'ct'], ['coffee', 12, 'oz']], 1652, 0),
  trip('trip-seed-3', 21, 'valuemart', [['whole-milk', 1, 'gal'], ['bananas', 6, 'ct'], ['eggs', 12, 'ct']], 963, 155),
  trip('trip-seed-4', 14, 'freshco', [['whole-milk', 1, 'gal'], ['coffee', 12, 'oz'], ['eggs', 12, 'ct']], 1877, 92),
  trip('trip-seed-5', 7, 'valuemart', [['whole-milk', 1, 'gal'], ['bananas', 6, 'ct'], ['spinach', 5, 'oz']], 869, 118),
  trip('trip-seed-6', 4, 'greenleaf', [['olive-oil', 16.9, 'fl_oz'], ['pasta', 32, 'oz']], 1452, 0),
];

const seed = {
  version: 1,
  seedNow: SEED_NOW,
  zips,
  retailers,
  items,
  products,
  pantry,
  lists,
  profiles,
  history,
};

const out = path.join(__dirname, '..', 'fixtures', 'seed.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(seed, null, 2) + '\n');
console.log(
  `Wrote ${path.relative(process.cwd(), out)}: ${products.length} products, ${retailers.length} retailers, ` +
    `${pantry.length} pantry items, ${lists.length} lists, ${profiles.length} profiles, ${zips.length} ZIPs, ${history.length} trips`,
);
