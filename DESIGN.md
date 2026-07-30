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
| Control fill | `#070a28` | Toggle track, select control |
| Panel | `#111539` | Insight panel, dropdown surface |

### Interaction
| Token | Value | Used for |
|---|---|---|
| Accent | `#ff46bb` | Toggle knob when on, section eyebrow |
| Active border | `#646eca` | Card active/selected border, open select border |
| Hover border | `#9fa9ff` | Card hover, select hover |
| Disabled border | `rgba(58,64,120,0.5)` | Disabled card, **2px dotted** — the dotted stroke is what reads as disabled, not the colour alone |

### Text
`rgba(255,255,255,·)` throughout — `1` selected · `0.92` control value · `0.8` body ·
`0.7` card label · `0.35` field label · `0.2` disabled.

### Datalake accents
16 accents, one per tile, applied to icon + label + dot + bottom glow **only in the
selected state**. Deliberately shuffled so neighbouring tiles contrast.

```
#46FEC3  #F43F5E  #2563EB  #FBBF24
#9333EA  #FF8000  #06B6D4  #EC4899
#10B981  #6258D8  #FB923C  #7C3AED
#F472B6  #00D4FF  #84CC16  #FF4560
```

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
- **Toggle** — 60×32 track, 24×24 knob, radius 40, 40×40 blurred glow behind the knob.
- **Select** — 36 high, radius 8, 1px border, panel offset 6, option 34 high, radius 6.
- **Insight panel** — 515×532, radius 12.

---

## Figma drift — RESOLVED (client decision, 2026-07-30)

**The code is the source of truth for this module, not the Figma landing.**
Do not "fix" the prototype back toward the Figma section.

1. **Tile 16** — stays *Support Chats* (Figma's *Trending offers* is outdated).
2. **Toggle copy** — *"Show only datasets available in LLMs"* (client email
   2026-07-29; newer than both the Figma text and the old V1 wording).
3. **Accent assignment** — stays as in code (Pricing `#477CEE`,
   Availability `#FF8000`).
4. **Naming** — the module is the *data layer* (*datalakes*); Figma's
   *signals / sources* wording is historical.
5. **Ellipse 849 (accent glow)** — deliberately moved from Figma's
   `top:102 / blur:40` to `118 / 32` so the glow stays under the tile label.

---

## Rules

1. **Never restyle V1.** It is the frozen reference. V2 owns `components/v2` + `lib/v2`.
2. **No new palette entries** without adding them here first.
3. **Icons come from Tabler through the script** — no hand-drawn SVG, no second icon set.
4. **Fixed 776px board is desktop-only.** Responsive behaviour is not designed yet;
   the control row already collapses, the grid does not.
