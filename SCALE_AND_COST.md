# Scale and Cost Strategy

How this local-only slice would grow into a synced product. **Every number below is a planning assumption, not a measurement.** Nothing here has been load tested.

## Quantitative assumptions (year 1)

| Input | Assumption |
|---|---|
| Monthly active users | 50,000 |
| Weekly active users | 40% of MAU = 20,000 |
| Basket compares | 2 per weekly user per week = 40,000 / week |
| List size | 15 items, 3 retailers per ZIP |
| Line price lookups | 40,000 x 15 x 3 = **1.8M / week** |
| ZIPs served | 500, so 1,500 retailer-ZIP catalogs |
| Catalog size | ~2,000 products per retailer-ZIP, ~150 KB gzipped |
| Analytics | ~25 events per weekly user per week = 500K / week, ~0.5 KB each = **~1 GB / month** |
| Restock reminders | Capped at 2 per user per week = at most 40,000 / week |

## Architecture choices

**Offline-first sync.** The device stays the source of truth, as it is today. Each change becomes an operation with an id (the app already gives list adds a request id and trips an id from the list revision). The server applies an operation once per id, so a retry after a dropped connection can't double-add. Conflicts: additions from two devices merge; for the same field, the newest edit wins and the losing value is kept in history.

**Guest-to-account migration.** Guests already get an anonymous id. On sign-up, the device uploads its state under that id and the server links `anonymousId -> accountId`. Past events are re-attributed on the server, not rewritten on the device. If the account already has data from another device, the user picks merge or replace. Two households are never merged silently.

**Cached product lookup.** Price lookups never hit the price feed per user. Each retailer-ZIP catalog is built once and cached at the CDN (6 hour TTL). Devices fetch only a delta since their last version. 1.8M line lookups a week become roughly 1,500 catalog builds every 6 hours plus small deltas.

**Privacy-conscious analytics.** Anonymous id only. No names, emails or addresses in event props (today's props are item ids, quantities and retailer ids). ZIPs are reported at 3 digits. Events batch on the device and upload on Wi-Fi. Raw events are kept 13 months, then only aggregates.

**Notification rate limits.** At most 2 restock reminders per user per week, at least 48 hours apart, never in quiet hours (9pm to 8am local), and never for an item already on the list. Two ignored reminders in a row pause them for 2 weeks.

**Feature flags.** Remote config flags for discovery, reminders, substitutions and each retailer. Every new flag defaults off and has a kill switch that works without an app release.

**App Store release testing.** TestFlight for internal and beta users, then a 7-day phased release. Crash-free sessions must stay above 99.5% before rollout continues.

## Bottlenecks

1. **Price feed freshness.** Stale prices are the biggest trust risk. The app flags prices older than 7 days, but the feed ingest itself has to keep up.
2. **ZIP fan-out.** Each new ZIP adds 3 catalogs to build and cache.
3. **Sync conflicts** when two people in one household edit the same list at once.
4. **Notification fatigue.** Too many reminders lead to opt-outs and uninstalls.

## Safeguards (most already exist in this repo)

- A missing price is `null`, never `$0`, and an incomplete basket can never be "Best deal".
- Trip completion and list adds are idempotent by id, so retries and double taps are safe.
- Saved data has a schema version. Unknown or corrupt data falls back to the seed and tells the user why.
- The retailer handoff opens nothing today. A real one would use only an allow-listed set of retailer URLs.
- Brand and retailer data stays separate. A discovery pick is never a paid placement and is labeled "Not sponsored".

## Cost model (monthly, year 1)

Unit rates are rough order-of-magnitude assumptions, not vendor quotes. Check current pricing before budgeting.

| Item | Driver | Assumed rate | Est. / month |
|---|---|---|---|
| Catalog builds | 1,500 catalogs x 4 per day | Serverless compute | ~$20 |
| CDN delivery | 50K users x ~2 MB of deltas | ~$0.08 / GB | ~$10 |
| Sync API | ~3M requests | ~$1 per 1M plus compute | ~$30 |
| Database | Lists, pantry, trips | Small managed Postgres | ~$50 to $150 |
| Analytics storage and queries | ~1 GB / month | Warehouse | ~$25 |
| Push notifications | At most ~175K / month | Usually free at this volume | ~$0 |
| **Infrastructure total** | | | **~$135 to $235** (about $0.003 to $0.005 per MAU) |

**The biggest unknown cost is price data licensing**, which is not modeled here. Infrastructure is small next to it.

## Rollback and fallback

- **Bad feature:** turn its flag off remotely. The app falls back to the current local behavior.
- **Bad build:** pause the phased release. Push a fix with an over-the-air update (would add `expo-updates`) or the previous binary.
- **Bad migration:** saved data keeps its schema version, so a new build can refuse unknown data instead of corrupting it.
- **Price feed down:** keep the last cached catalog and mark prices stale. Never show a guessed price.
- **Sync down:** the app keeps working offline and queues operations until it can sync.

## Funnel metrics

1. **Activation:** % of new users who build a list of 3 or more items and run a basket compare within 24 hours.
2. **Trip completion:** % of compares that end in "Complete trip" within 7 days.
3. **Week-2 retention:** % of new users who complete a second trip within 14 days.

## Experiment: reason-labeled restock reminder

- **Hypothesis:** a reminder that says *why* ("Down to 2.8 oz. You restock at 3 oz.") and adds the item in one tap brings people back for a second trip.
- **Control:** restock suggestions show on Kitchen only, with no reminder.
- **Treatment:** after a trip, one rate-limited in-app reminder for the top suggestion, with its reason and an "Add to list" button.
- **Guardrails:** reminder dismissal rate under 60%, notification opt-out not up by more than 1 point, no drop in crash-free sessions.
- **Success criterion:** week-2 retention up by at least **3 percentage points** (assumed baseline 25%) at 95% confidence, with guardrails held.
- **Sample size:** about **3,400 new users per arm** (two-sided, alpha 0.05, power 0.8). At an assumed ~2,000 sign-ups a week, enrollment takes about 3.5 weeks, plus the 14-day window, so about 6 weeks total.
