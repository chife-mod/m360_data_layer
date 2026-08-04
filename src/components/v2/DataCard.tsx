"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchSvgAsset } from "@/lib/utils";
import type { SourceItem } from "@/lib/v2/sources-data";
import { cardStyles } from "@/lib/v2/card-styles";
import {
  FactGlyph,
  ICON_COMPASS,
  ICON_DATABASE,
  ICON_SKIP_BACK,
} from "./fact-icons";

/**
 * Lake facts a tile may carry (client, 2026-08-04: "хочу видеть прямо на
 * плитках — архив, глубину, наличие эксплорера"). The board passes whole
 * Datalake objects as `source`, so these fields simply surface here; the
 * watches set has none and renders no marks. Marks are indicators only —
 * the tooltips and the explorer link live in the panel's passport strip.
 */
type TileFacts = {
  archiveYears?: number;
  zeroDayIndexed?: boolean;
  explorerUrl?: string;
};

export type CardState =
  | "default"
  | "hover"
  | "active"
  | "activeHover"
  | "selected"
  | "selectedHover"
  | "disabled"
  | "disabledHover"
  | "disabledSelected";

export type CardInteractionState = {
  isHovered: boolean;
  isActive: boolean;
  isSelected: boolean;
  isDisabled: boolean;
};

/**
 * What the top-right corner zone does (client call, 2026-08-03: body click
 * swaps the selection, the corner adds to it — picking a pair is real but not
 * frequent enough to own the whole tile):
 *   "add"    — tile can join the current combination; corner shows a "+"
 *   "remove" — tile is selected; corner (the indicator dot) takes it out
 *   "none"   — corner is inert (LLM mode, incompatible, selection full)
 */
export type ComboMode = "add" | "remove" | "none";

type Props = {
  source: SourceItem & TileFacts;
  index: number;
  state?: CardState;
  isSelected?: boolean;
  isHovered?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  /** Body click — makes this tile THE selection (single-select swap). */
  onSelect?: () => void;
  /** Corner-zone click — adds to / removes from the combination. */
  onToggleCombo?: () => void;
  comboMode?: ComboMode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

/**
 * Pixel-perfect styles from Figma component-set node-id=222-5989.
 * Card: 191×130, borderRadius 12, clip true
 * Layout: VERTICAL center/center, gap 12, padding 24
 * Styles are imported from @/lib/v2/card-styles — single source of truth.
 */

export function DataCard({
  source,
  index,
  state,
  isSelected = false,
  isHovered = false,
  isActive = false,
  isDisabled = false,
  onSelect,
  onToggleCombo,
  comboMode = "none",
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const [iconSvg, setIconSvg] = useState<string>("");
  const [cornerHovered, setCornerHovered] = useState(false);

  let currentState: CardState;
  if (isDisabled) {
    // Disabled is no longer inert (2026-08-04): selected-while-unavailable
    // brightens the dotted stroke (no inner glow — picked, not lit), and a
    // clickable disabled tile answers hover with its border.
    currentState = isSelected
      ? "disabledSelected"
      : isHovered && onSelect
        ? "disabledHover"
        : "disabled";
  } else if (isSelected) {
    currentState = isHovered ? "selectedHover" : "selected";
  } else if (isActive) {
    currentState = isHovered ? "activeHover" : "active";
  } else {
    currentState = isHovered ? "hover" : state || "default";
  }

  const s = cardStyles[currentState];

  /** One duration for every cross-fade, so the whole tile settles together. */
  const STATE_MS = 180;
  const isSolidBorder = s.borderType === "solid" && s.borderStyle !== "dotted";
  const isDottedBorder = s.borderStyle === "dotted";

  const accentColor = source.color;
  const iconColor = isSelected ? accentColor : "rgba(255, 255, 255, 1)";
  // The label stays white when selected. Accent on 14px text sat right on the
  // WCAG AA threshold (4.5:1) while white is 17.6:1, and selection is already
  // carried by the border, the glow, the dot and the icon — recolouring the
  // text was a fifth signal, and the most fragile one. The tile's colour link
  // to the panel survives on the icon, dot and glow, which are graphics and so
  // only owe 3:1.
  const textColor = "rgba(255, 255, 255, 1)";

  useEffect(() => {
    let live = true;
    fetchSvgAsset(`/assets/icons/${source.icon}.svg`).then((svg) => {
      if (live) setIconSvg(svg);
    });
    return () => {
      live = false;
    };
  }, [source.icon]);

  const processedIcon = iconSvg
    ? iconSvg.replace(
      /stroke-width="[^"]+"/g,
      `stroke-width="${s.iconStrokeWidth}"`
    )
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative"
      // A compatibility-dimmed tile still takes a body click — clicking it
      // simply starts a fresh selection there (the dotted style now means
      // "cannot join the current combination", not "inert"). Only tiles the
      // page gave no handler to (LLM mode) are truly dead.
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: "191px",
          height: "130px",
          backgroundColor: s.bg,
          borderRadius: "12px",
          boxShadow: s.shadow === "none" ? undefined : s.shadow,
          cursor: onSelect ? "pointer" : "not-allowed",
          // Deliberately NOT `all`: animating the border made the tile pass
          // through a half-drawn outline on every state change.
          transition: `background-color ${STATE_MS}ms ease, box-shadow ${STATE_MS}ms ease`,
        }}
      >
        {/* ── Border layers ──────────────────────────────────────────────────
            All three are always mounted and cross-fade by opacity.
            They used to be one animated `border` on the card: switching to the
            disabled look snapped border-style to dotted while border-width was
            still animating 0 -> 2px, so the tile visibly grew a dotted outline
            instead of simply fading. Opacity is the only thing that moves now,
            and the border sits on overlays rather than the box, so the content
            no longer shifts by the border width either. */}

        {/* Default & Hover — gradient hairline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "12px",
            padding: `${s.borderType === "gradient" ? s.borderWidth : 1}px`,
            background: `linear-gradient(180deg, ${
              s.gradientStops ?? cardStyles.default.gradientStops
            })`,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: s.borderType === "gradient" ? 1 : 0,
            transition: `opacity ${STATE_MS}ms ease`,
            zIndex: 20,
          }}
        />

        {/* Active & Selected — solid hairline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "12px",
            border: `1px solid ${s.borderColor ?? "transparent"}`,
            opacity: isSolidBorder ? 1 : 0,
            transition: `opacity ${STATE_MS}ms ease`,
            zIndex: 20,
          }}
        />

        {/* Disabled — dotted outline. Colour comes from the current state:
            plain disabled, its hover, and disabled-selected share the stroke
            style and differ only in brightness. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "12px",
            border: `2px dotted ${
              isDottedBorder
                ? s.borderColor
                : cardStyles.disabled.borderColor
            }`,
            opacity: isDottedBorder ? 1 : 0,
            transition: `opacity ${STATE_MS}ms ease, border-color ${STATE_MS}ms ease`,
            zIndex: 20,
          }}
        />

        {/* Ellipse 850 — top-left white corner glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "-46px",
            top: "-46px",
            width: "92px",
            height: "92px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 1)",
            filter: "blur(40px)",
            transform: "translate3d(0,0,0)",
            opacity: s.showCornerGlow ? s.cornerGlowOpacity : 0,
            transition: `opacity ${STATE_MS}ms ease`,
          }}
        />

        {/* Ellipse 851 — bottom-right white corner glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: "-46px",
            bottom: "-46px",
            width: "92px",
            height: "92px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 1)",
            filter: "blur(40px)",
            transform: "translate3d(0,0,0)",
            opacity: s.showCornerGlow ? s.cornerGlowOpacity : 0,
            transition: `opacity ${STATE_MS}ms ease`,
          }}
        />

        {/* Ellipse 849 — bottom accent glow (Selected / Selected Hover).
            Figma puts it at top:102 with a 40px blur, which on a 130px card
            spills up to roughly y=62 — right through the label, so a selected
            tile lost contrast on its own name. Dropped and tightened so the
            light stays under the text. Making the label white instead was not
            an option: the same accent names the lake in the panel alongside. */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "32px",
            top: "118px",
            width: "128px",
            height: "128px",
            borderRadius: "50%",
            backgroundColor: iconColor,
            filter: "blur(32px)",
            opacity: s.glowOpacity * 0.85,
            transform: "translate3d(0,0,0)",
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Connection dots */}
        {source.connectionDots?.includes("top") && (
          <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)] z-20" />
        )}
        {source.connectionDots?.includes("right") && (
          <div className="absolute top-1/2 -right-[5px] -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)] z-20" />
        )}

        {/* Content */}
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          style={{ padding: "24px", gap: "12px" }}
        >
          {processedIcon && (
            <div
              style={{
                width: "32px",
                height: "32px",
                opacity: s.iconOpacity,
                color: iconColor,
                flexShrink: 0,
                transition: `opacity ${STATE_MS}ms ease, color ${STATE_MS}ms ease`,
              }}
              dangerouslySetInnerHTML={{ __html: processedIcon }}
            />
          )}

          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "19.6px",
              letterSpacing: "0",
              textAlign: "center",
              color: textColor,
              opacity: s.textOpacity,
              whiteSpace: "nowrap",
              fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              transition: `opacity ${STATE_MS}ms ease, color ${STATE_MS}ms ease`,
            }}
          >
            {source.label}
          </span>
        </div>

        {/* ── Lake facts, on the tile itself (client, 2026-08-04) ────────────
            A quiet mark row along the bottom edge: archive depth as "15Y"
            with the database glyph, zero-day as the skip-back glyph, an
            explorer as the compass. Glyphs match the panel's passport strip
            one-to-one, so the tile teases what the panel explains. Rides
            the label's opacity so disabled tiles dim it with everything
            else; pointer-events none — the tile's click stays whole. */}
        {(source.archiveYears !== undefined ||
          source.zeroDayIndexed ||
          source.explorerUrl) && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: 0,
              right: 0,
              bottom: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: s.textOpacity,
              transition: `opacity ${STATE_MS}ms ease`,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {source.archiveYears !== undefined && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  lineHeight: 1,
                  fontFamily:
                    "var(--font-inter), Inter, system-ui, sans-serif",
                }}
              >
                <FactGlyph size={11}>{ICON_DATABASE}</FactGlyph>
                {source.archiveYears}Y
              </span>
            )}
            {source.zeroDayIndexed && (
              <FactGlyph size={11}>{ICON_SKIP_BACK}</FactGlyph>
            )}
            {source.explorerUrl && (
              <FactGlyph size={11}>{ICON_COMPASS}</FactGlyph>
            )}
          </div>
        )}

        {/* Ellipse 867 — indicator dot, top-LEFT since 2026-08-04: the client
            split the corners — selection state lives left, the Add/Remove
            affordance lives right — so neither ever has to yield to the
            other. Always mounted: unmounting it made the dot pop out instead
            of fading with the rest of the tile. */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: "8px",
            top: "8px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor:
              s.dotFill === "currentColor" ? accentColor : s.dotFill,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            opacity: s.showDot ? 1 : 0,
            transition: `opacity ${STATE_MS}ms ease, background-color ${STATE_MS}ms ease`,
          }}
        />

        {/* ── Corner affordance (top-right) — the multi-select entry point ───
            Body click swaps the selection; this corner is the only place that
            edits the combination (client calls, 2026-08-03/04). It exists
            only while it can do something: "Add +" on compatible tiles once
            anything is selected, "Remove ×" on selected tiles once the
            combination has at least two — excluding the only pick is not a
            thing, a body click already clears it. Shows on TILE hover. */}
        {comboMode !== "none" && (
          <div
            role="button"
            aria-label={
              comboMode === "add" ? "Add to selection" : "Remove from selection"
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggleCombo?.();
            }}
            onMouseEnter={() => setCornerHovered(true)}
            onMouseLeave={() => setCornerHovered(false)}
            className="absolute z-30"
            style={{
              right: 0,
              top: 0,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              gap: 6,
              // 8px insets — the same edge gap the indicator dot keeps in the
              // left corner, so both corners breathe identically (client,
              // 2026-08-04). The bottom/left padding widens the hit zone so
              // the label and near-misses still register.
              padding: "8px 8px 14px 14px",
              cursor: "pointer",
              // The whole affordance rides tile hover — before that the tile
              // is clean, after a click it is gone again.
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? "auto" : "none",
              transition: `opacity ${STATE_MS}ms ease`,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                lineHeight: "24px",
                color: cornerHovered
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.7)",
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                userSelect: "none",
                transition: `color ${STATE_MS}ms ease`,
              }}
            >
              {comboMode === "add" ? "Add" : "Remove"}
            </span>
            <span
              aria-hidden
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.95)",
                backgroundColor: cornerHovered
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(255,255,255,0.08)",
                border: `1px solid ${
                  cornerHovered
                    ? "rgba(255,255,255,0.65)"
                    : "rgba(255,255,255,0.4)"
                }`,
                transition: `background-color ${STATE_MS}ms ease, border-color ${STATE_MS}ms ease`,
              }}
            >
              {/* Drawn glyphs, not text: a font "+" carries its own line
                  metrics and never sits optically centred in the circle. */}
              {comboMode === "add" ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M5 1V9M1 5H9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 2L8 8M8 2L2 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
