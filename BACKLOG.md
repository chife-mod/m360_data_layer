# Backlog — M360 Data Layer

Everything discussed with the client but **not** built. Anything that was
agreed and shipped lives in [history/HISTORY.md](history/HISTORY.md) instead.

Rule for this file: an item lands here only if it came up in a call or an email
and was consciously postponed. Each entry says where it came from, so nothing
gets re-litigated from memory.

Status legend: **[client]** waiting on content or a decision from Vsevolod ·
**[us]** ours to build once prioritised · **[open]** no decision either way yet.

---

## 1. Content still missing

### 1.1 Overviews for the remaining banking datasets — **[client]**
Source: calls of 2026-07-29 and 2026-07-30 ("мы просто пойдём и каждому будем дописывать").

Written so far: Banks, Media, KOLs: Finance, KOLs: Celebrities, Reviews: Banks,
Reviews: Branches, Reviews: Apps.

Still **empty — 9 of 16**: Branches & ATMs, Owned: SoMe, Owned: Blogs,
Owned: Ads, Owned: Newsletters, Products & Services, Regulators,
Payment Systems, Search Demand.

Lorem was removed on 2026-07-30 ("пускай будет пусто") — these datasets now
show a title, the tabs and nothing else. The gap is the status report: what is
blank has not been written.

Vsevolod said he was writing "последний слой" (the bottom row) right after the
2026-07-30 call.

### 1.2 Apps for the remaining datasets — **[client]**
Datasets with no app show `Tasks & Apps [0]` and a one-line empty state. Nine
datasets are in that position (same list as 1.1, minus whatever arrives with
the bottom row).

### 1.3 Combination copy for banking — **[client]**
`bankingPairs` and `bankingTriples` are empty objects: no two- or three-dataset
combination in Banking has copy, so selecting two datasets shows the titles and
an empty panel. Watches still has its authored pair/triple copy.

### 1.4 Copy that is mine, not the client's — **[open]**
Written by me to keep the prototype presentable, never reviewed by him:
- Type-selector subtitles: "Institution perspective", "Scheme perspective",
  "Creator perspective", "Manufacturer perspective", "Seller perspective"
  (`lib/v2/datalakes.ts`).
- Build Report parameter lists: the six banks, and the two languages
  (`components/v2/InsightPanel.tsx`).

---

## 2. Product ideas parked by the client

### 2.1 Cross-dataset universal tasks — **[open]**
Source: call of 2026-07-29. Vsevolod: tasks that read *several* lakes at once,
e.g. the Benchmarking 360 report which spans all 16. He explicitly filed this as
strategic, not for the demo: "у меня нет большого списка этих универсальных
задач".

Related: showing the Overview / Tasks & Apps tabs **when nothing is selected**,
as the surface for those cross-lake tasks. Currently the panel shows its empty
state with no tabs. Same call, same "let's get there" verdict.

### 2.2 Template mode vs builder mode — **[open]**
Source: call of 2026-07-29. Idea of a switch: browse templates when you are new,
jump straight to the builder once you know them. Vsevolod: "мы сейчас не решаем
идеальный интерфейс через полтора года, мы делаем прототип билдера на сегодня."

Partly overtaken — Build Report now sits in both the card and the template
popup, so both paths are one click. The explicit mode switch is still unbuilt.

### 2.3 Report-level flexibility: banks × cities — **[client]** / **[us]**
Source: call of 2026-07-30. The Build Report parameters should eventually cover
the real matrix: pick 3 banks and compare across every Ukrainian city, or 50
banks in one city (Poltava was his example). Today the builder has one Bank,
one Period, one Language.

Also raised for Benchmarking 360 itself: the current layout holds ~5–6 banks
before it stops scaling ("хер отмасштабируешь"), and he wants an arbitrary set
of banks compared across 16 datasets in one click.

### 2.4 The "one-click sadness report" — **[open]**
Source: call of 2026-07-30. The pitch he wants to be able to demo: a couple of
clicks and out comes a quarter's worth of pain — media, influencers, locations,
apps — as one report. This is the destination the builder is heading toward, not
a discrete task.

### 2.5 LLM orchestration over the 16 datasets — **[open]**
Source: call of 2026-07-30. Long-horizon: feed the 16 datasets to a model, state
your goals, get told what to do; scenario analysis. Explicitly "future", noted
so it is not lost.

---

## 3. Outside this module

### 3.1 Aspect-map view in the BI dashboard — **[us, other project]**
Source: call of 2026-07-30. The aspect card surfaces ~46 top-level groups where
it should show ~20; the grouping needs rework, and he wants a critical review of
the view. **This is the BI dashboard, not the data layer** — recorded here only
so it does not evaporate.

### 3.2 Green Report from his table — **[client]**
Source: call of 2026-07-29, high priority at the time. He was to send a table to
cut into a 2–3 page Green Report, plus cover details. The table never arrived;
on 2026-07-30 he confirmed this is a separate track from the data layer.

---

## 4. Known technical debt

### 4.1 Responsive layout — **[us]**
The board is a fixed 1296px (776 grid + 515 panel). The control row collapses,
the grid does not. Vsevolod asked for "в перспективе адаптивно" on 2026-07-28
and has not raised it since; every demo so far has been desktop.

### 4.2 Two dashboards share one URL — **[client]**
`Reviews: Banks` and `Reviews: Branches` both point at `sf-bi.ai/4bPUieM`,
exactly as written in the brief of 2026-07-30. Possibly deliberate, possibly a
copy-paste — worth one line of confirmation.

### 4.3 Deploy window shows a bare board — **[us]**
While GitHub Pages rebuilds (~1 min) the icon requests can fail, and tiles
render without icons for that window. No longer catastrophic — the loader
rejects non-SVG responses since the "unicorn" incident — but a real fix would
inline the icons at build time instead of fetching them.

### 4.4 Pre-existing type errors — **[us]**
`npx tsc --noEmit` reports errors in V1 files and the copied V2 DataCard
(`connectionDots`, `hasSelectedCard` on `SourceItem`). They predate this work
and are why `next.config.ts` sets `ignoreBuildErrors`. Harmless today, but they
mask real errors in anything new.

### 4.5 Are the Figma export scripts still wanted? — **[open]**
`scripts/export-figma-*.js` (11 files) predate this engagement. Nothing in the
current workflow uses them — Figma comes through MCP now, and icons through
`scripts/tabler-to-project-icon.py`. They still work and are documented by
`knowledge-base/figma-export-guide.md`.

If they are dead, remove the scripts **and** the guide together. Deleting one
without the other is the only outcome worth avoiding.
