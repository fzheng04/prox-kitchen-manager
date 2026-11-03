import seedJson from '../../fixtures/seed.json';
import type { Catalog, Seed } from '../logic/types';

export const SEED = seedJson as Seed;

export const CATALOG: Catalog = {
  zips: SEED.zips,
  retailers: SEED.retailers,
  items: SEED.items,
  products: SEED.products,
};
