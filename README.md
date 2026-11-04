# Prox Kitchen Manager (Track E)

A mobile kitchen manager and repeat-shopping loop built with React Native, Expo and TypeScript. It tracks a pantry, builds a grocery list, compares baskets across three synthetic retailers, suggests one transparent "try something new" pick, and closes the loop: completing a trip restocks the pantry, and advancing a mock clock changes the restock suggestions.

Everything runs on the device. There is no backend, no login and no cloud credentials. All data is synthetic and seeded from `fixtures/seed.json`.

- **Demo video:** [ADD 2-4 MINUTE DEMO LINK]
- **Demo script:** [DEMO.md](DEMO.md)
- **Scale and cost plan:** [SCALE_AND_COST.md](SCALE_AND_COST.md)
- **AI usage:** [AI_USAGE.md](AI_USAGE.md)

## Setup

Requires Node 22+ (CI uses Node 26) and npm. For iOS, use Xcode's iOS Simulator or the Expo Go app on a phone.

```bash
npm ci            # install exact versions from the lockfile
npx expo start    # then press i for the iOS simulator, or scan the QR code with Expo Go
```

No environment variables or accounts are needed.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run web` | Open straight in the iOS simulator or a browser |
| `npm test` | Run all unit and integration tests (Jest) |
| `npm run typecheck` | TypeScript check with `tsc --noEmit` |
| `npm run lint` | ESLint with the Expo config |
| `npm run seed` | Regenerate `fixtures/seed.json` (deterministic, byte-identical every run) |

CI (`.github/workflows/ci.yml`) runs all of these on every push to `main`: install, typecheck, lint, tests, a seed-determinism check (`git diff --exit-code fixtures/`), and a web bundle build.

## Test results

Run on a clean checkout of `main` (commit `74c2640`):

```
Test Suites: 3 passed, 3 total
Tests:       110 passed, 110 total
```

| File | Tests | Covers |
|---|---|---|
| `tests/logic.test.ts` | 6 | The core mandatory adverse cases, one test each |
| `tests/scenarios.test.ts` | 25 | End-to-end scenarios against the real seed |
| `tests/units.test.ts` | 79 | Each logic module on its own: units, pricing, matching, basket, pantry, discovery, reducer, persistence, analytics |

### Mandatory adverse tests

| Case | Where it is tested |
|---|---|
| 1 gallon vs 128 fl oz | `logic.test.ts`: "1 gallon equals 128 fl oz" |
| Missing price in one store | `logic.test.ts`: "missing price is never $0..." |
| Cheaper incomplete basket | `units.test.ts`: "a store missing one price is incomplete... and is flagged as cheaper" |
| Repeated tap creates two copies | `logic.test.ts`: "repeated tap with the same request id adds once" |
| Expired special price | `logic.test.ts`: "expired special is not the active price" |
| Brand preference vs cheaper alternative | `scenarios.test.ts`: "brand preference wins over a cheaper product..." |
| Empty pantry | `scenarios.test.ts`: "empty pantry gives no stock-based suggestions and no crash" |
| Persisted list after restart | `logic.test.ts`: "list persists across restart; corrupt data recovers" |
| Dismissing a suggestion | `scenarios.test.ts`: "dismissing a pick persists per profile and changes future ranking" |
| Weekly clock rollover | `scenarios.test.ts`: "weekly clock rollover changes the recommendation..." |
| Double shopping-trip completion | `logic.test.ts`: "double trip completion applies once" |
| Guest user without login | `scenarios.test.ts`: "guest user works without login..." |

## Completed features

**Kitchen (home tab)**
- Pantry inventory with live stock (used up over mock time), "Low" badges and a low-stock count.
- Up to 4 suggested restocks. Every one shows its reasons: low quantity, running out, usual restock (purchase recurrence), or saved preference.
- Weekly value summary: items running low, saved this week, trips and spend this week.
- Add or edit pantry items by hand.

**List**
- Add, edit and delete items with quantities and units. Search-as-you-type against the local catalog.
- Ambiguous entries ("milk", "yogurt") stay unpriced until the user picks the exact item.
- Pin a brand or "Organic only" per item. Multiple saved lists.
- Repeated quick taps add once. Each add carries a request id, and the reducer ignores ids it has already seen.

**Compare**
- One basket per retailer serving the ZIP, with total, "X of Y items" coverage, and Missing, Stale, Special, Substitute and No price flags.
- Only the cheapest **complete** basket can be "Best deal". A cheaper incomplete basket gets a banner listing exactly what it is missing, and its total is labeled "partial total".
- Unit prices, package math ("2 x 64 fl oz covers 1 gal") and a plain-language substitution note on each line.
- When a brand or organic preference costs more, the cheaper product is shown with the savings and a "Use this" button. It is never swapped in silently.
- Complete a trip, or a simulated retailer handoff (no site is opened, nothing is ordered).

**Discover**
- One "Try something new" pick, labeled "Not sponsored". It must match a category the profile asked to discover, the organic preference, and stock with a current price at the user's store and ZIP.
- Shows why it was picked. "Not for me" dismisses it, and each dismissal lowers that category in future picks.

**Trips (retention loop and demo controls)**
- Trip history and total saved.
- Mock clock: Advance a day or a week. Pantry use, stale prices, usual restocks and reminders all follow it.
- Simulated in-app restock reminder after a trip or a clock advance (no push permission needed).
- Switch profile (Organic-first or Budget-first) and ZIP (94110 or 94612).
- Start empty, Reset demo, Reload from storage, and the debug Event log.

**Analytics:** all 7 required events (`app_session_started`, `list_item_added`, `search_result_selected`, `basket_compared`, `retailer_handoff_tapped`, `pantry_restock_suggested`, `shopping_trip_completed`). Each has an event id, session id, wall-clock timestamp, mock-clock time and anonymous user id, and is stored locally only.

**Engineering states:** loading screen while storage is read, zero search results, partial baskets, no basket complete, save failure with Retry, unreadable or corrupt saved data (falls back to the seed and says why), two ZIPs, and full relaunch.

## Architecture

```
src/
  logic/        Pure TypeScript, no React. All business rules live here.
    units.ts      Unit families, conversion (1 gal = 128 fl oz), quantity parsing
    pricing.ts    Active price (specials and expiry), stale check, unit price
    matching.ts   Catalog search ranking, ambiguity check, duplicate feed rows
    basket.ts     Line pricing, preferences, substitutions, basket ranking
    pantry.ts     Consumption, purchases, recurrence, restock ranking
    discovery.ts  "Try something new" pick and dismissal penalty
    analytics.ts  Event shape and de-duplicated append
    clock.ts, summary.ts, money.ts, types.ts
  state/        Glue between logic and React
    reducer.ts    Every state change, as a pure reducer
    app-state.tsx Context provider: hydrate, save, sessions, events
    derived.ts    Hooks that run logic against state (screens call these)
    persistence.ts, storage.ts   Versioned save and load through a swappable key-value store
  app/          Expo Router screens. Presentation only.
  components/   UI building blocks
fixtures/       seed.json and its record formats (fixtures/README.md)
scripts/        generate-seed.js (deterministic seed generator)
tests/          Jest tests
```

**How data flows:** the catalog (retailers, items, 93 products) ships with the app and is never stored. Everything the user changes (pantry, lists, trips, profiles, clock, events) lives in one `AppState`. Each change goes through the reducer, then is saved to AsyncStorage under `prox:state` inside a `{ schemaVersion, state }` envelope. Writes are chained so they land in order.

**Key design decisions**
- **Business logic is pure functions.** Screens never price or rank anything themselves; they read from hooks in `state/derived.ts`. This is why 110 tests run in about 2 seconds without rendering a screen.
- **Money is integer cents everywhere.** A missing price is `null`, never `0`, so it cannot quietly make a basket look cheaper.
- **Idempotency by id, not by disabling buttons.** List adds use a request id built from the item, list and list revision. Trip ids are `trip-<listId>-r<revision>`, so a second tap on "Complete trip" is a no-op. Analytics events carry a dedupe key, so re-renders cannot log twice.
- **Mock clock instead of real time.** The clock is the seed start plus a whole number of days. Tests and the demo are fully deterministic.
- **Storage is behind an interface** (`KeyValueStore`), so tests run against an in-memory store that can be told to fail reads or writes.

## Seed data

`fixtures/seed.json`: 93 products across 3 retailers (FreshCo 33, ValueMart 29, Greenleaf 31), 27 catalog items, 15 pantry items, 3 saved lists, 2 profiles, 2 ZIPs and 6 past trips. It includes duplicate feed rows, a missing price, an expired special, stale prices, missing items, organic variants, a brand conflict, different package sizes and ZIP-limited products. Record formats and the full list of deliberate edge cases are in [fixtures/README.md](fixtures/README.md).

## Assumptions

- Prices, retailers, brands and ZIP labels are all synthetic. No production data is downloaded.
- One household per device, in guest mode with a random anonymous id. No login.
- A price older than 7 days is "stale". It is still used, but flagged.
- Pantry use is steady: current stock = measured quantity minus daily use times days since it was measured.
- A new pantry item with no history is assumed to last two weeks and is flagged low when a quarter is left.
- The trip total is the chosen basket's estimate. Savings are measured against the priciest complete basket.
- Weight and volume are never converted into each other (no densities), so honey sold in fl oz is "not comparable" with a list in oz.

## Limitations

- No real retailer handoff. The button logs the event and shows a notice.
- The restock reminder is in-app only. There are no real push notifications.
- Pantry use is a straight line per item; it does not learn from actual behavior beyond the seeded daily-use rate.
- Purchases in a unit that can't be converted to the pantry unit are skipped, not guessed.
- One device only. There is no sync and no account migration yet (planned in SCALE_AND_COST.md).
- Analytics never leave the device. The log keeps the newest 500 events.
- The UI has no automated render tests. Tests cover logic, the reducer and persistence.

## Time spent

| Area | Hours |
|---|---|
| Design (data model, flows) | 3 |
| Implementation | 4|
| Testing | 1 |
| Debugging | 1 |
| Documentation | 1 |
| **Total** | 10 |

## Next three priorities

1. [ ] e.g. Component tests for the List and Compare screens (render, double tap, empty states).
2. [ ] e.g. Real retailer handoff through a safe, allow-listed deep link.
3. [ ] e.g. Learn daily use from the user's own trips instead of the seeded rate.
