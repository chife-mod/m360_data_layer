# Project History Log

---

## 2026-07-30 — The working version moves to the root

`/v2` -> `/`, and the frozen first version moves `/` -> `/v1`. It is no longer
"version two of something", it is the data layer, and the URL should say so.

`/v2` is kept as a redirect stub: that link had been shared around all day, and
without it every copy would 404.

Dashboard cards renamed to **M360 Data Layer** and **Data Layer V1**.

---

## 2026-07-28 — V2: industry / type selectors + banking datalakes

Client brief (email + meeting, 2026-07-28). Deadline driver: Mastercard call 2026-07-30.

### Done — brief points 2, 3, 4
- **Industry selector** — Watches | Banking | Retail
- **Type selector** — depends on industry (Watches: Brand/Retailer/Influencer,
  Banking: Bank/Payment System/Influencer, Retail: Retailer/Brand/Influencer).
  Resets to the industry's first type on change.
- **Banking set** — 16 datalakes verbatim from the brief, in its order; the four
  blocks of four map onto the four grid rows.
- **Retail** — points at the watches set on purpose ("Keep watches"), not a stub.
- 16 banking icons + 2 UI icons generated from Tabler via
  `scripts/tabler-to-project-icon.py`.

### Architecture
- `lib/v2/datalakes.ts` — `DatalakeSet` registry, industries, set-aware helpers.
  The page renders whichever set the current industry points at.
- `lib/v2/datalakes-banking.ts` — banking data.
- `components/v2/Select.tsx` — dark combobox on project tokens. Options are real
  `<button role="option">`, so they take focus and reach the a11y tree.

### Two V1 bugs fixed in V2 (V1 left untouched)
- **Asymmetric relations.** `recommendedWith` was one-directional, so the set of
  available tiles depended on click order (Ads offered Pricing, Pricing did not
  offer Ads). Now read as undirected.
- **Empty insight copy.** Roughly half the reachable pairs had no authored text and
  rendered blank. Authored copy still wins; anything else gets a composed fallback.

### Brief point 1 — renamed
`Market360_Signal_Selector` -> `m360_data_layer`, on the client's go-ahead.
Repo renamed via `gh repo rename`, `basePath` and `NEXT_PUBLIC_BASE_PATH`
updated, git remote repointed, gh-pages redeployed.
**The old `chife-mod.github.io/Market360_Signal_Selector/` URL is dead** —
anything pointing at it (decks, chats, bookmarks) needs updating.
New URL: https://chife-mod.github.io/m360_data_layer/

### Not done — needs a decision
- **Brief point 5** — Jobs to be Done / Use Case / App. Deferred by the client
  ("сделаем пока первый апдейт"). Data model is ready for it: a JTBD list hangs
  off a datalake id.

### Copy
Banking descriptions are **placeholder**. The client asked for lorem ipsum;
literal lorem ipsum was not used because of the Mastercard call — the lines are
written in the watches voice. All of it still needs the client's real text.

### Design basis
`DESIGN.md` added — tokens, icon pipeline, and the recorded drift between the
Figma landing and this prototype (tile 16 naming, toggle copy, accent assignment).

---

## 2026-07-28 — Versioning: V1 frozen, V2 opened

### Why
Further work on the Signal Selector needs a stable reference to compare
against and roll back to. Sharing components between versions would defeat
that — any edit for V2 would silently change V1.

### Structure
- `/` — **V1, frozen.** Own tree: `components/ui/*` + `lib/{signals,sources,card-styles}`
- `/v2` — **V2, working version.** Own tree: `components/v2/*` + `lib/v2/*`
- Only `lib/utils.ts` (`getAssetPath`) stays shared — pure path helper, no design

**Rule: never edit V1 files to serve V2.** Copies are intentional here.

### Version switcher
- `components/VersionSwitcher.tsx` — floating pill, bottom-right, on both pages
- Chrome only: fixed overlay, does not participate in either version's layout
- Uses `next/link`, so the basePath is applied automatically

### Dashboard
- Two cards now: Signal Selector V2 (`wip`) and Signal Selector V1 (`live`)

### Verified
- Dev: `/`, `/v2`, `/dashboard` → 200; switching V1 ↔ V2 works
- `npm run build` → `/v2` prerendered static, `out/v2.html` emitted
  (same flat-file form as the already-deployed `/dashboard`)
- Turbopack does not pick up a newly created route dir — dev server needs a restart

---

## 2026-02-19 — Signal Intersection Explorer

### Layout
- Left: 4×4 grid of signal tiles (reuses DataCard)
- Right: Insight panel (515×532px) with empty state / 1–3 signals

### Logic
- 5 active signals: Brands, Pricing, Availability, Reviews, Media
- Max 3 selections; compatibility matrix in `signals-data.ts`
- `getCompatibleSignals()` — which tiles stay clickable

### Right panel
- Empty: sparkles icon + “Select multiple signals…”
- 1–3 signals: icons (64px, no frame), colored titles, descriptions, Analyze button
- Animated bar chart (15 bars): heights + colors change with selection
- Bar outline gradient: 20% opacity top → 0% bottom

### Stack
- React, TypeScript, Next.js, Framer Motion, Tailwind
- Pushed to GitHub: https://github.com/chife-mod/M360_C
- Deploy: Vercel (connect repo) or `npx vercel --prod`

---

## 2026-02-18 — Card System & Interactive Grid

### Pixel-perfect DataCard (7 states)
- Inspected Figma component-set `node-id=222-5989` via REST API
- Built `DataCard.tsx` with all 7 states: Default, Hover, Active, Active Hover, Selected, Selected Hover, Disable
- Styles extracted directly from Figma: sizes, colors, borders, shadows, blur ellipses
- Disable state: `dotted` border 2px, no corner glows, icon stroke-width 1px (vs 2px on others)
- Corner white glows (Ellipse 850/851) hidden in Disable
- Bottom green glow (Ellipse 849) only in Selected / Selected Hover

### Icon export
- Exported 16 clean SVG icons from Figma frame `node-id=289-4743`
- Saved to `public/assets/final-icons/` and `public/assets/icons/`
- Icons processed: `currentColor` stroke/fill, no `<g>` opacity, correct 32×32 frame

### Card demo page (`/card-demo`)
- Single Brands card with state switcher (7 states)
- Figma PNG reference side-by-side for comparison

### Main page (`/`)
- Clean 4×4 grid, gap 4px (matches Figma frame `node-id=277-3520`)
- Background `#111539`
- All cards interactive: hover, click to select

### Unique accent colors per card
- Each of 16 verticals has its own color for Selected state (icon + text + dot + bottom glow)
- Colors shuffled to maximize contrast between neighbors
- Blues/purples boosted in saturation

### Card connections (interactive prototype)
- `cardConnections` map in `sources-data.ts`: each card has 3 related cards
- Click a card → it enters Selected state, its 3 connections enter Active state
- Example: Brands → Pricing, Products, Availability

---

## 2026-02-19 — Deployment Issues & Fixes

### GitHub Pages (Failed)
- Attempted to deploy to GitHub Pages
- Issues with asset paths (CSS/JS 404s) due to subdirectory hosting (`/M360_C/`)
- Tried configuring `basePath` and `assetPrefix` in `next.config.ts` but styles remained broken

### Netlify (Success)
- Switching to Netlify for easier root-domain hosting
- Created `netlify.toml`:
  - Build command: `npm run build`
  - Publish directory: `out`
- Removed `basePath` / `assetPrefix` from Next.js config to serve from root
- Deploy successful: https://graceful-cendol-0a11de.netlify.app/
