# M360 Data Layer — design basis

What this module inherits from the Market360 site, so V2 and everything after it
stay consistent with it instead of drifting into their own look.

**Source of truth:** Figma — `Market 360 Design`, file `oR5AwDiD7ek4IxUOgyZCbU`.
- Home page frame: `4:19862`
- This module's section: `92:90` "Verticals" (1440×836), heading *"Where product signals come from."*
- Card component set: `222:5989` (7 states)
- Toggle: `306:1522`
- Controls row: `322:1401`

> Figma has **no published variables** on these nodes (`get_variable_defs` returns `{}`).
> Tokens below were read off the styles and off the code that was originally
> extracted from Figma pixel-perfect. If variables get published later, they win.

---

## Colour

### Surfaces
| Token | Value | Used for |
|---|---|---|
| Canvas / card fill | `#111539` | Section background and card fill — the same value, cards separate by border and glow, not by fill |
| Control fill | `#070a28` | Toggle track, select control, Ask bar and chat composer inputs |
| Panel | `#111539` | Insight panel, dropdown surface, chat drawer |
| Tooltip | `#1b2050` | Fact-chip hover tooltips — one step lighter than the panel so it reads as floating |

### Interaction
| Token | Value | Used for |
|---|---|---|
| Accent | `#ff46bb` | Toggle knob when on, section eyebrow |
| Active border | `#646eca` | Card active/selected border, open select border |
| Hover border | `#9fa9ff` | Card hover, select hover |
| Disabled border | `rgba(58,64,120,0.5)` | Disabled card, **2px dotted** — the dotted stroke is what reads as disabled, not the colour alone |
| Disabled hover border | `rgba(100,110,202,0.65)` | Disabled card under the cursor — disabled tiles take clicks since 2026-08-04 |
| Disabled selected border | `rgba(159,169,255,0.8)` | Picked-while-unavailable (LLM mode): same dotted stroke, brighter, **no inner glow** — picked, not lit |

### Text
`rgba(255,255,255,·)` throughout — `1` selected · `0.92` control value · `0.8` body ·
`0.7` card label · `0.35` field label · `0.2` disabled.

### Datalake accents
16 accents, one per tile, applied to icon + dot + bottom glow **only in the
selected state** — never to the label, see below. Deliberately shuffled so
neighbouring tiles contrast.

```
#46FEC3  #F43F5E  #2563EB  #FBBF24
#9333EA  #FF8000  #06B6D4  #EC4899
#10B981  #6258D8  #FB923C  #7C3AED
#F472B6  #00D4FF  #84CC16  #34D399
```

Position 16 was `#FF4560` until 2026-08-03 — on the banking board it sat on
Search Demand and read as the same red as Media (`#F43F5E`), and the client
asked for a green ("он должен быть какой-то зелёный"). `#34D399` (emerald,
~9:1 on `#111539`) replaced it **in both sets** — same-position-same-colour
across industries is the rule, so watches' Support Chats moved with it.

### The accent never colours 14px text (2026-07-30)

**A selected tile keeps its label white.** Accent on a 14px label sat right on
the WCAG AA threshold, while white on `#111539` is **17.6:1**. Selection is
already carried by the border, the glow, the dot and the icon — recolouring the
text was a fifth signal and the most fragile one. The tile's colour link to the
panel survives on the icon, dot and glow.

That is what keeps the palette honest to Figma: **the accent only has to clear
3:1** — the graphics/large-text bar — because everything it touches is either a
graphic or the 26px panel title. One colour needed a lift even for that:

| was | now | ratio |
|---|---|---|
| `#4338CA` | `#6258D8` | 2.23 -> 3.28 |

The other three (`#2563EB` 3.41, `#7C3AED` 3.10, `#9333EA` 3.28) are the Figma
originals and stay.

**Adding an accent?** It must clear 3:1 on `#111539`, and if you ever put it on
body-sized text it must clear 4.5:1 — which is the reason labels are white.

Every datalake set reuses this palette **in the same grid positions**, so switching
industry keeps the board's colour rhythm.

---

## Typography

Inter throughout (`next/font`, `--font-inter`).

| Role | Size / weight / line-height |
|---|---|
| Section H2 | 40 / 600 |
| Body, toggle label | 14 / 400 / 19.6px |
| Control value | 14 / 400 / 20px |
| Field label | 11 / 400 / uppercase / `0.06em` |
| Card label | 14 / 400 |

---

## Icons — Tabler

The site uses **Tabler Icons**; Figma instances are named `Tabler Icons / tabler:*`.

Project icons are Tabler glyphs whose **geometry is scaled 24 → 32 while
`stroke-width` stays 2**. That makes the stroke proportionally thinner than stock
Tabler (2/32 rather than 2/24), and it is the weight the cards were designed around.

`DataCard` rewrites `stroke-width` at runtime (2 normal, 1 disabled) with a regex,
so the attribute must be literally present on the paths and correct in 32-unit
space. A `transform="scale(4/3)"` wrapper would scale the stroke too and the regex
would keep clobbering any compensation — hence real coordinate scaling.

**Adding an icon:**

```bash
python3 scripts/tabler-to-project-icon.py <tabler-name> <project-name>
```

Writes `public/assets/icons/<project-name>.svg`. Arc commands are handled correctly
(only `rx`, `ry` and the endpoint scale; rotation and both flags pass through).

Naming: `bk-*` for banking, `ui-*` for interface chrome, bare names for the
original watches set.

---

## Component tokens

- **Card** — 191×130, radius 12, padding 24, vertical centre, gap 12. Grid gap 4 → row width 776.
  The body is single-select. The corners split the rest (2026-08-04): the
  **indicator dot lives top-LEFT**, the **Add/Remove affordance top-RIGHT** —
  a 24px labelled circle on tile hover, anchored 14px from its corner like
  the dot is from its own. "Add +" appears on compatible tiles once anything
  is selected; "Remove ×" on selected tiles only once the combination has
  **two or more** — the sole pick has nothing to be excluded from, a body
  click already clears it. Before the first pick the tile is clean: hover,
  click, chosen.
- **Toggle** — 60×32 track, 24×24 knob, radius 40, 40×40 blurred glow behind the knob.
- **Select** — 36 high, radius 8, 1px border, panel offset 6, option 34 high, radius 6.
  Options may be `disabled`: muted, keyboard-skipped, click keeps the list open.
- **Insight panel** — 515×532, radius 12. Since 2026-08-03 the inside is **one
  scroll column**, no tabs and no icon badges: title → overview text →
  **facts strip** → Sources → Enrichment → Tasks & Apps [n] → Prompts →
  Insights · Weekly → History. Section headings are
  **18px/600 plain white** — landmarks, not whispers (2026-08-04); sections
  open with a `rgba(255,255,255,0.08)` hairline. Source rows carry the site's
  real favicon on a 26px white tile (assets under `public/assets/sources/`),
  and the volume column ends flush on the same right edge as the heading's
  aside — nothing moves on hover. The
  decorative bar chart at the panel's foot was removed on 2026-08-03 ("он
  весёлый, но он не функция").
- **Panel type floor** (2026-08-04, "двенадцатый — это уже слишком
  маленький"): running text and data values are **≥13px**; primary copy
  14–15px. 12–12.5px is reserved for footnotes, chips and timestamps only,
  and never below `rgba(255,255,255,0.4)` — small AND faint was failing the
  4.5:1 AA bar (12px at 0.35 alpha ≈ 3.2:1 on `#111539`).

---

## Patterns settled 2026-08-04

Approaches this build established; reuse them instead of re-deciding.

- **Folding sections.** Every panel section collapses on its whole heading
  row (44px target beats a 16px chevron); the chevron points **up = open,
  down = folded** — the sideways disclosure arrow read wrong. Fold state
  persists in localStorage (`m360.collapsed.v1`) per *set : selection :
  section*. The heading-to-body gap lives INSIDE the height-animated
  wrapper, or the fold leaves a phantom flex gap.
- **Fact chips + tile micro-marks.** Lake-level facts (archive depth,
  zero-day, explorer) appear twice, same glyphs both times (shared
  `fact-icons.tsx`): as 28px chips with 240px hover tooltips under the
  panel overview, and as a quiet 10–11px glyph row on the tile's bottom
  edge — indicators only, `pointer-events: none`, riding the label's
  opacity. The tile teases, the panel explains and links.
- **Mini-chip.** One shape for sample / draft / artifact-format markers:
  10px uppercase, `0.04em`, radius 4, `1px 5px` padding, bordered
  `rgba(255,255,255,0.15–0.18)`. Format chips sit in a **fixed 52px
  column, left-aligned** (ragged left edges wander) with the timestamp in
  its own 76px right-aligned column.
- **Journal rows are two-line cards.** Title line (icon · title · format
  column · time column), parameter line indented to the title's left edge,
  Rebuild surfacing there on hover. Their hover pill extends **±14px**
  with matching inner padding — wider than the one-line rows' ±10px —
  so content never sits on the pill's edge.
- **Honesty rules.** Any figure the client has not supplied wears the
  `sample` chip. AI output is never invented: a prompt "runs" as an
  outgoing bubble plus a **shimmer** answer and the caption naming what
  wires it up in the real M360.
- **The chat door.** The Ask bar sits **under the board** (a composer, the
  messenger convention — above the grid it reads as a search box, and the
  controls-scope-the-tiles pair must stay unbroken; a corner FAB hides the
  scope reaction entirely). Bar: 52 high, radius 12, `#070a28`, focus
  border `rgba(159,169,255,0.7)`; picked lakes mirror in as radius-7
  colour-dot chips and the placeholder rewrites itself. The drawer slides
  from the right (min(440px, 92vw), `#111539`), **no backdrop** — the
  board stays clickable and re-scopes the open chat live. One chat
  channel: the bar and the panel's prompt rows open the same drawer.
- **Scrollbars.** `.m360-scroll` hides WebKit stepper buttons (Windows
  drew them clipped by the panel's corner radius) and the panel's scroll
  column sits 4px off the panel edges — padding returns the 4px, so
  content never moved.

---

## Figma drift — RESOLVED (client decision, 2026-07-30)

**The code is the source of truth for this module, not the Figma landing.**
Do not "fix" the prototype back toward the Figma section.

1. **Tile 16** — stays *Support Chats* (Figma's *Trending offers* is outdated).
2. **Toggle copy** — *"Show only datasets available in LLMs"* (client email
   2026-07-29; newer than both the Figma text and the old V1 wording).
3. **Accent assignment** — stays as in code (Pricing `#2563EB`,
   Availability `#FF8000`).
4. **Naming** — the module is the *data layer* (*datalakes*); Figma's
   *signals / sources* wording is historical.
5. **Ellipse 849 (accent glow)** — deliberately moved from Figma's
   `top:102 / blur:40` to `118 / 32` so the glow stays under the tile label.

---

## Rules

1. **Never restyle V1.** It is the frozen reference. V2 owns `components/v2` + `lib/v2`.
2. **No new palette entries** without adding them here first.
3. **Icons come from Tabler** — card icons (32px assets) through the script;
   small inline UI glyphs (≤16px, stroked with currentColor) live as Tabler
   path constants in `components/v2/fact-icons.tsx`. No hand-drawn SVG, no
   second icon set, no third home for glyphs.
4. **Fixed 776px board is desktop-only.** Responsive behaviour is not designed yet;
   the control row already collapses, the grid does not.
