# Prox kitchen app — UI kit

Interactive 390×844 prototype of the kitchen-manager app, composed from the design-system components (`window.Prox`, loaded from `_ds_bundle.js` or transpiled from `components/` by `ds-loader.js`).

Screens
- **KitchenHome.jsx** — weekly value summary, running-low strip, suggested restocks with explicit reasons (low quantity / expected depletion / purchase recurrence / saved preference), pantry inventory with category filter.
- **GroceryList.jsx** — list card: add / edit / delete, qty + unit, search-as-you-type against the local catalog, ambiguous-item resolution sheet, organic + brand pins, duplicate guard (700 ms add lock, same-item detection, 180 ms stepper debounce).
- **BasketCompare.jsx** — 3 retailers, totals, coverage (n of m), Missing/Stale flags, "Best deal" only for complete carts, unit-price view, substitutions with reasons, per-line swaps, Complete trip.
- **Discover.jsx** — one transparent "Try something new" pick constrained by explicit preference, category and store availability; "Not for me" dismissal down-ranks that category.
- **Trips.jsx** — savings to date, mock clock, trip history.
- **App.jsx** — phone shell, tab bar, simulated restock reminder banner, demo panel (mock clock, reset, restart).
- **data.js** — fictional catalog/retailers + pure logic (suggestions, compare, discover, advance clock, completeTrip).

State persists in `localStorage` under `kitchen-kit-v1` (schema v2) — "Restart app" reloads the page to prove it.
Retailer names (FreshCo Market, ValueMart, Greenleaf Grocer) and brands are fictional; no retailer logos are shipped.
