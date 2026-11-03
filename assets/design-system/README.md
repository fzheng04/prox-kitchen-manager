# Prox Design System

Prox is a mobile kitchen manager + grocery-savings app: it tracks what's in your pantry, builds a grocery list, finds the cheapest store(s) for that cart, and nudges you to restock before you run out. The visual language is warm and tactile — a night-navy chrome over an oat "kitchen counter" ground, tomato primary actions, money-green prices, and ink-outlined tile controls with straight-down shadows.

## Sources
- **GitHub:** https://github.com/fzheng04/prox-kitchen-manager (branch `main`) — currently an Expo / Expo Router starter (`create-expo-app`). Useful pieces: `src/global.css` (declares **Spline Sans** as `--font-display`), `src/constants/theme.ts` (spacing scale 2/4/8/16/24/32/64, max content width 800). No product screens, brand assets or logo exist there yet. Explore the repo further as it grows — it will become the source of truth for components.
- **Screenshots** (`uploads/IMG_7358–7360.PNG`) — used only as loose structural inspiration (header + list + store compare). Palette, type, shapes, motifs and copy were deliberately changed so this app has its own identity.

## Products
One product: the kitchen-manager mobile app (iOS-first, Expo). Tabs: Kitchen · List · Discover · Trips. The UI kit implements the brief's required flows: Kitchen Home, Grocery List, Basket Compare, Product Discovery, and the trip → pantry → reminder retention loop.

## Index
- `styles.css` — entry point; `@import`s only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `guidelines/` — 14 foundation specimen cards (Colors, Type, Spacing, Brand).
- `components/` — React primitives (see below), each with `.d.ts` + `.prompt.md`, one card per folder.
- `ui_kits/prox-app/` — interactive app recreation (`index.html`), see its README.
- `thumbnail.html`, `SKILL.md`, `github.md`.

## Components
- **core/** — `Icon`, `Button`, `IconButton`, `Pill`, `Badge`, `CategoryChip`
- **forms/** — `SearchField`, `SegmentedControl`, `QuantityStepper`
- **display/** — `Card`, `EmptyState`, `ProgressBar`, `ReasonTag`, `SavingsCard`
- **navigation/** — `AppHeader`, `TabBar`
- **grocery/** — `NotebookList`, `NotebookRow`, `RetailerRow`

The repo defines no components; this set was authored for the brief. **Intentional additions** not visible in the screenshots: `QuantityStepper` (brief requires quantities/units), `ReasonTag` (brief requires explaining every recommendation), `Icon` (wrapper for the Lucide set).

---

## CONTENT FUNDAMENTALS
- **Voice:** calm, practical, specific. Lead with the useful fact, not a slogan: "Eggs run out in ~2 days", "Priced across 3 nearby stores", "FreshCo Market has everything for $28.74".
- **Person:** speaks to **you** ("Your pick this week", "You buy this every 7 days"). "We" only when explaining reasoning ("Why we suggest it").
- **Casing:** sentence case everywhere — titles, buttons, pills, tabs ("Compare stores", "Complete trip", "Add to list"). Only small status badges are uppercase ("BEST DEAL", "MISSING 2", "12% LESS").
- **Numbers:** prices always `$0.00`; coverage as "4 of 5 items"; days as "~3 days".
- **Honesty:** every recommendation says why; nothing is labeled cheapest when items are missing; stale prices say how old they are; discovery picks say "Not sponsored".
- **Emoji:** none. Exclamation marks: avoid.

## VISUAL FOUNDATIONS
- **Color:** Night `#1C2233` owns the header, tab bar and featured rows; oat `#F5F0E6` is the app ground; cards are white or oat-50. Primary action is tomato `#E4572E`. Money/savings are always green `#1F8A5B`. Mustard `#F6CB6E`/`#E9A23B` for badges and highlights on dark. Sage `#D3E6C8` for soft highlight surfaces. Food categories have tint+swatch pairs.
- **Type:** Bricolage Grotesque 700–800 for titles, buttons, chips and prices; Spline Sans (from the repo) for body and fine print. Titles 28px left-aligned; body 16px; hero prices 40px.
- **Outlines + shadows:** interactive surfaces carry a 2px ink border and a **straight-down, unblurred ink shadow** (2/3/4px). Soft blurred shadows only on floating sheets and banners.
- **Corner radii:** buttons and inputs 14px rounded rectangles; cards 20px; chips and badges pill; category swatches 6px.
- **Cards:** white/oat fill + ink border + tile shadow. Featured/selected rows invert to night with mustard prices. No colored left-border cards, no gradients.
- **Backgrounds:** flat colors only — no textures, patterns or gradients. Product imagery: category-tinted icon tiles (no photos shipped).
- **Press state:** element drops by its shadow height and the shadow collapses; fills darken a step. Hover (web): cursor only.
- **Motion:** ease-out 120–200ms; sheets slide up 260ms; toggles use a gentle spring.
- **Transparency/blur:** only the reminder banner (97% oat + blur) and sheet scrim (night 45%). Header icon buttons use 14% white "glass".
- **Layout:** night header with left-aligned title, actions right, search docked below; night tab bar where the active tab gets a translucent pill and mustard icon; 16px gutters; chip rows scroll horizontally and bleed off the edge.

## ICONOGRAPHY
- **Lucide** outline icons (2px stroke, round caps), inlined from the lucide-static@0.460.0 CDN via the `Icon` component. Swap for your own set if you adopt one.
- No emoji, no unicode-as-icon (except "↳"/"↓" in dense compare lines). Category is signaled by colored rounded-square swatches.

## Brand mark
No logo by design. Screens carry no wordmark; the header title does the work.

## Fonts
- **Spline Sans** — declared by the repo; loaded from Google Fonts.
- **Bricolage Grotesque** — display face, loaded from Google Fonts.
