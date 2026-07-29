"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getAssetPath } from "@/lib/utils";
import type { SourceItem } from "@/lib/v2/sources-data";
import { cardStyles } from "@/lib/v2/card-styles";

export type CardState =
  | "default"
  | "hover"
  | "active"
  | "activeHover"
  | "selected"
  | "selectedHover"
  | "disabled";

export type CardInteractionState = {
  isHovered: boolean;
  isActive: boolean;
  isSelected: boolean;
  isDisabled: boolean;
};

type Props = {
  source: SourceItem;
  index: number;
  state?: CardState;
  isSelected?: boolean;
  isHovered?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
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
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const [iconSvg, setIconSvg] = useState<string>("");

  let currentState: CardState;
  if (isDisabled) {
    currentState = "disabled";
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
  const textColor = isSelected ? accentColor : "rgba(255, 255, 255, 1)";

  useEffect(() => {
    fetch(getAssetPath(`/assets/icons/${source.icon}.svg`))
      .then((res) => res.text())
      .then(setIconSvg)
      .catch((err) => console.error(`Failed to load icon ${source.icon}:`, err));
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
      onClick={!isDisabled ? onClick : undefined}
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
          cursor: isDisabled ? "not-allowed" : "pointer",
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

        {/* Disabled — dotted outline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "12px",
            border: `2px dotted ${cardStyles.disabled.borderColor}`,
            opacity: isDottedBorder ? 1 : 0,
            transition: `opacity ${STATE_MS}ms ease`,
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

        {/* Ellipse 867 — indicator dot top-right.
            Always mounted: unmounting it made the dot pop out instead of
            fading with the rest of the tile. */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            right: "8px",
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
      </div>
    </motion.div>
  );
}
