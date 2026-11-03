TRACK E: MOBILE APP, PERSONALIZATION & RETENTION
Challenge: Build a Functional Kitchen Manager and Repeat-Shopping Loop
Business situation: Prox is more than a price-comparison page. It should help a shopper manage pantry items, create the next grocery list, compare a basket, discover useful new brands, and know when to restock. Build a functional mobile slice that connects these moments without needing a real backend.
Required product
Use React Native + Expo + TypeScript. The app must run in an iOS simulator or Expo Go, with a video fallback if reviewer lacks the simulator. Use local seeded JSON and local persistence (SQLite, AsyncStorage, or equivalent); no real authentication or cloud credentials required.
Seed at least 60 synthetic products across 3 retailer catalogs, at least 15 pantry items, three saved shopping lists, two user preference profiles, two retailer ZIPs, and at least 6 historical shopping actions. Include duplicates, stale prices, missing items, organic flags, brand preferences, and different item/package sizes.
Required interactive screens
Kitchen Home: pantry inventory and low-stock summary, personalized suggested restocks, and a compact weekly value summary. The recommendation must explain why an item is suggested (low quantity, expected depletion, purchase recurrence, or saved preference). No placeholder-only cards.
Grocery List: add/edit/delete items with quantities and units, search-as-you-type against the local catalog, manually resolve ambiguous items, allow pinned brand/organic preferences, and persist through full app restart. Prevent accidental duplicate quantities from quick repeated taps.
Basket Compare: show estimated total for each of at least three retailers, match coverage, stale or missing price flags, and selected product alternatives. Do not label an incomplete cart the cheapest without exposing missing items; support unit comparison and a reasonable substitution explanation.
Product Discovery: show an optional 'Try something new' suggestion constrained by an explicit user preference, category, and retailer availability. Treat it as a transparent recommendation, not a paid placement. Show why it was suggested and let a user dismiss it; dismissal affects future results.
Retention loop: completing a shopping trip updates pantry stock and history and can trigger a simulated restock reminder. Provide a resettable mock clock or scenario toggle to demonstrate a second week and a changed recommendation. Do not require real push-notification permissions.
Required engineering behavior
Handle initial loading, zero search results, partially available baskets, async/persistence failures, multiple ZIPs, and app relaunch. Keep business logic out of presentation components; create testable functions for price normalization, retailer comparison, pantry consumption/reorder logic, and recommendation ranking.
Instrument meaningful local analytics events: app_session_started, list_item_added, search_result_selected, basket_compared, retailer_handoff_tapped, pantry_restock_suggested, and shopping_trip_completed. Each must include a consistent event ID, session ID, timestamp, and anonymous user ID. Display a debug event log and avoid duplicate events for repeat renders.
Mandatory adverse tests
1 gallon vs 128 fl oz; missing price in one store; cheaper incomplete basket; repeated tap creates two copies; expired special price; brand preference conflicts with cheaper alternative; empty pantry; persisted list after restart; dismissing suggestion; weekly clock rollover; accidental double shopping-trip completion; guest user without login.
Submission acceptance checks
The reviewer can create a list from scratch, add multiple products, compare store baskets, mark one trip complete, see pantry inventory update, advance the simulated clock, and get a changed restock suggestion. The app persists across relaunch and includes executable unit tests for matching, ranking, pricing, and event de-duplication.
10-hour suggested work plan
1 hour: state/data model; 
3 hours: screens and navigation; 
2 hours: basket/pantry/recommendation logic; 
1.5 hours: persistence and analytics; 
1.5 hours: tests/edge cases; 
1 hour: documentation and demo.
Scale & Cost Strategy
Outline offline-first data sync, guest-to-account migration, privacy-conscious analytics, notification rate limits, cached product lookup, feature flags, App Store release testing, and measurable activation/retention experiments. Propose 3 product funnel metrics and one experiment with control, treatment, guardrail, and success criterion.
Final Submission, Interview, and Evaluation
Required repository structure
README.md: setup, commands, assumptions, architecture, links to demo, completed features, limitations.
src/ or app/: complete implementation, with no downloaded production datasets.
fixtures/ and scripts/: deterministic sample generator or seed files, with documented record formats.
tests/: executable automated unit/integration tests and clear expected outputs.
SCALE_AND_COST.md: one page with quantitative assumptions, bottlenecks, safeguards, cost model, and rollback or fallback.
AI_USAGE.md: tools, prompts/agent directions, generated components, debugging, corrections, and independent judgment.
DEMO.md: ordered 2–4 minute walkthrough showing setup, core flow, one difficult edge case, and actual automated test results.
Review rubric and gating
Pass-forward recommendation: generally >=80/100, with working core functionality, meaningful automated tests, and no critical tenant leak, silent price corruption, or unsafe redirect. 65–79: interview if the work shows substantial original judgment and the gaps are specific/remediable. Below 65: generally do not proceed. These thresholds are guidance, not automatic hiring decisions.
Core red flags: app fails to start from clean checkout; output is largely a slide deck rather than software; claimed functionality cannot be demonstrated; evaluation tests are fabricated or altered; hard-coded outputs pass only the examples; AI-generated code is not understood; no isolation of brand data; destructive live operations; fabricated benchmarks; secrets in repo.
Review interview (15–20 minutes): candidate explains one design tradeoff, traces one failing test, describes their AI-assisted debugging, and makes a small modification requested by the reviewer. We assess understanding rather than memorized implementation details.
Time reporting and accommodations
In your README, report approximate active hours by design, implementation, testing, debugging, and documentation. We do not demand a perfect solution after 10 hours. Candidates should stop at the time cap, describe their next three priorities, and may request a reasonable accommodation or an alternate evaluation format without penalty.
Submission instructions
Submit at least 24 hours before your scheduled interview, or by the agreed deadline. Email partnerships@joinprox.com (cc: alston@joinprox.com)  with subject: Prox Engineering Intern Assessment – [Your Name] – Track [A/B/C/D/E]. Include the repository link (or access invitation), 2–4 minute demo link, and brief notes on setup requirements or blockers.
We value engineers who can turn AI assistance into correct, efficient, explainable, and maintainable software. Strong submissions make their tradeoffs, failure modes, and limitations explicit.
