# Project History Log

---

## WHERE THINGS STAND — 2026-08-04

**Live:** https://chife-mod.github.io/m360_data_layer/ · local `npm run dev` ->
`http://localhost:3000/m360_data_layer` (the basePath applies in dev too; the
bare root 404s). Frozen first version at `/v1`, launcher at `/dashboard`.
`/v2` redirects to `/`.

Deploy is manual: `npm run build` -> publish `out/` to the `gh-pages` branch.
Nothing in CI does this. Versioning is by commit — no v3 directory; roll back
through git if a direction dies (agreed 2026-08-04).

**What the module is now.** Industry (Watches / Banking / Retail, plus four
DISABLED roadmap industries) and Type selectors scope a 4x4 board of 16
datasets. **Clicking a tile selects that tile** — single-select swap, even on
a compatibility-dimmed tile; combinations (up to 3) are built from the tile's
top-right **corner zone**: "+" adds, the dot/"×" removes. The right-hand panel
is **one scroll column, no tabs**: title → the dataset's copy → **Sources**
(top 5 of N with monthly volumes, links out) → **Tasks & Apps [n]** →
**Insights · Weekly** (2–3 findings with a "sample" chip). Sources and
Insights exist for the pilot dataset only — Reviews: Banks. The decorative
bar chart is gone. An app card still carries role tags, title, description,
**Build Report** plus Report Templates / Dashboard links; Build Report opens
the three-parameter popup (Bank / Period / Language), the card opens the
template popup with the captured-pages strip.

**Content status — Banking, the set that matters.** 7 of 16 datasets have the
client's copy: Banks, Media, KOLs: Finance, KOLs: Celebrities, Reviews: Banks,
Reviews: Branches, Reviews: Apps. The other 9 are deliberately **empty**, not
filler. Apps exist for Banks (1), both KOLs (2 each) and all three Reviews
(1 each) — 9 in total. Watches keeps its original copy from February; Retail
points at the watches set on purpose. The Reviews: Banks sources list and
weekly insights are **sample data flagged in BACKLOG §1.4** — shapes he asked
for, figures he has not supplied.

**Immediate next step:** show him the 2026-08-03 brief built (this session);
he still owes the bottom-row overviews. The three think-first items from that
brief — Role & Tasks view, output history, the LLM-coverage argument — are
BACKLOG §2.6–2.8. Everything else outstanding is in [BACKLOG.md](../BACKLOG.md).

**Two standing rules** that cost real time to establish, both in
[DESIGN.md](../DESIGN.md): the code — not the Figma landing — is the source of
truth for this module, and an accent colour never colours body-sized text
(which is why selected tiles keep white labels).

---

## 2026-08-04 — The 2026-08-03 brief: click logic, tabless panel, pilot sources & insights

Email + call of 2026-08-03 ("новые вводные"), built the next day. The part
becomes "более важная, более data-intense" — less chrome, more content, fewer
clicks to the goal ("минимальное время до шашлыка").

### Click logic — body selects, corner combines
Picking a pair was the primary gesture but not the frequent one ("задача
выбрать пару актуальна, но не настолько частотна"). Now a body click selects
exactly that tile wherever the selection stood — including on a
compatibility-dimmed tile, which starts a fresh selection instead of demanding
Reset. The corner affordance took two refinement rounds on 2026-08-04:
**nothing before the first pick** ("я не добавляю, я просто выбираю" — a
virgin board is plain hover-and-click); then tile hover shows a labelled
24px "Add +" on compatible tiles; **"Remove ×" only once two or more are
selected** — the sole pick has nothing to be excluded from ("выбор-то один"),
a body click already clears it. The corners split to stop competing: the
indicator dot moved **top-left**, the affordance owns **top-right**. LLM mode
stays single-select and shows no corner affordances.

### The panel: one scroll, no tabs
"Иконка убили, заголовок поднялся, овервью слово убили, место под табы убили,
всё поднялось." The icon-badge row, the tab bar and the decorative bottom
chart are gone; the panel is a single scrollable column — title, overview
copy, then sections with hairline tops: Sources, Tasks & Apps [n], Insights ·
Weekly. Empty-state copy now teaches the new gesture ("Select a dataset to
explore it — or combine up to three with the corner +").

### Sources & Insights — pilot on Reviews: Banks only
Per the brief, one group first. Sources: top 5 of 8 review sites with monthly
intake, each row a link ("в один клик открыть"); MinFin / Vidhuk / Banki.ua
are his names from the overview copy, the rest is sample (BACKLOG §1.4).
Insights: three weekly findings closing the column — negativity leaders with
mini bars (the trio he read off his own dashboard), a trending complaint, one
positive counter — wearing a "sample" chip. Multi-selection hides both
sections: sources belong to one dataset.

### Roadmap industries, disabled
Pharma, Film Festivals, Fashion, Books join the Industry selector muted with
"Coming soon" and an empty datalake set behind them — visible roadmap, nothing
selectable ("хер выберешь, но она есть"). The Select grew real disabled-option
support: keyboard skips them, click keeps the list open.

### Palette: position 16 red → emerald
Search Demand's `#FF4560` read as Media's red; he asked for green. `#34D399`
in both sets (watches' Support Chats moved with it) so same-position-same-
colour survives. DESIGN.md updated.

### LLM mode: filtered-out tiles explain themselves
Third round of the day. In LLM mode a filtered-out tile is clickable now: the
click picks it in a new **disabledSelected** state — the same dotted stroke,
brighter, deliberately no inner glow ("выделяем чуть ярче… но без внутреннего
освещения") — and the panel drops its content for the "why not" view: a
"Not available in LLMs" slug, the title in light grey instead of its accent,
and a lorem paragraph where the real argument (hallucinations, coverage,
freshness) will go. The lorem is BY CLIENT REQUEST ("вставь Lorem Ipsum, не
придумывай текст") — a deliberate exception to the no-lorem rule of
2026-07-30, which was about unwritten copy pretending to be finished. This is
the first built step toward BACKLOG §2.8 (making LLM coverage legible).
Disabled tiles also gained a hover answer (border brightens) since they all
take clicks now.

### One robustness fix the demo style forced
The panel content crossfade dropped `mode="wait"`: with body clicks making
dataset-hopping the default gesture, a click landing inside the 200ms exit
window left the panel stuck on the outgoing dataset. Concurrent crossfade
(both nodes absolute, overlap for the fade) survives arbitrary click speed.

---

## 2026-07-30 — Second and third client rounds

Two calls and two emails on the day of the Mastercard demo. In order:

### Layout and defaults
- Banking rows 2 and 3 swapped: Reviews now follows KOLs, Owned drops to third.
- Board opens on **Banking / Payment System** — what the demo needs.
- Build Report defaults to **Oschadbank**; the client vetoed PUMB as a demo
  default and monobank for the Mastercard audience.
- `Tasks & Apps [n]` carries the app count; `[0]` plus a one-line empty state
  where nothing is written.

### Content
- Banks, KOLs: Finance, KOLs: Celebrities overviews.
- Reviews: Banks / Branches / Apps — overviews and one app each.
- KOLs get two apps each: Influencers Benchmarking (dashboard) and Influencer
  Analytics (report + 10-page preview strip).
- Benchmark UA Banks lands on the Banks dataset with all five role tags.
- **All lorem removed.** Unwritten copy is an empty string and the panel renders
  no paragraph at all — an empty `<p>` would still claim its line-height.

### Build Report
New popup in the template popup's chrome: Bank / Period / Language and one
button. Period is a hand-rolled Toggl-style range picker — shortcut rail, two
month grids with ISO week numbers, free start/end selection. Submit opens the
PUMB Monthly Pulse, standing in for the pipeline. Dismissing the calendar with
a backdrop click no longer costs the whole dialog.

### Visual
- One primary button per row, two secondary.
- Panel header calmed: 52px dark tiles with 26px strokes instead of naked 64px
  glowing icons; title 32 -> 26.
- Inner glow eased; the accent glow dropped below the tile label so a selected
  tile stops losing contrast on its own name.
- Selector options became colour-coded tiles with subtitles, reusing the board's
  accents so the colour coding stays one system. Bank options carry the banks'
  own favicons on white tiles.
- **Contrast pass.** `Reviews: Branches` measured 2.23:1 and failed even the
  3:1 bar. Fixed at the root: labels stay white, so the accent only owes 3:1 and
  three of the four colours went back to their Figma originals.

### The unicorn
During a Pages redeploy the icon requests returned GitHub's HTML error page, and
every icon loader injected it unchecked — the client watched GitHub's error
mascot render inside the tiles. All seven fetch-and-inject sites now go through
`fetchSvgAsset`, which requires a parseable lone `<svg>` and yields "" for
anything else.

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
