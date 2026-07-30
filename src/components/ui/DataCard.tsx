"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchSvgAsset } from "@/lib/utils";
import type { SourceItem } from "@/lib/sources-data";
import { cardStyles } from "@/lib/card-styles";

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
 * Styles are imported from @/lib/card-styles — single source of truth.
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
  const accentColor = source.color;
  const iconColor = isSelected ? accentColor : "rgba(255, 255, 255, 1)";
  const textColor = isSelected ? accentColor : "rgba(255, 255, 255, 1)";

  // Guarded fetch — not a V1 restyle. The raw fetch injected whatever came
  // back (GitHub's error page during a Pages redeploy) into the card.
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
          border:
            s.borderType === "solid"
              ? `${s.borderWidth}px ${s.borderStyle ?? "solid"} ${s.borderColor}`
              : "none",
          boxShadow: s.shadow === "none" ? undefined : s.shadow,
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
        }}
      >
        {/* Gradient border — Default & Hover */}
        {s.borderType === "gradient" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: "12px",
              padding: `${s.borderWidth}px`,
              background: `linear-gradient(180deg, ${s.gradientStops})`,
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              zIndex: 20,
            }}
          />
        )}

        {/* Ellipse 850 — top-left white corner glow */}
        {s.showCornerGlow && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: "-46px",
              top: "-46px",
              width: "92px",
              height: "92px",
              borderRadius: "50%",
              backgroundColor: `rgba(255, 255, 255, ${s.cornerGlowOpacity})`,
              filter: "blur(40px)",
              transform: "translate3d(0,0,0)",
            }}
          />
        )}

        {/* Ellipse 851 — bottom-right white corner glow */}
        {s.showCornerGlow && (
          <div
            className="absolute pointer-events-none"
            style={{
              right: "-46px",
              bottom: "-46px",
              width: "92px",
              height: "92px",
              borderRadius: "50%",
              backgroundColor: `rgba(255, 255, 255, ${s.cornerGlowOpacity})`,
              filter: "blur(40px)",
              transform: "translate3d(0,0,0)",
            }}
          />
        )}

        {/* Ellipse 849 — bottom-center green glow (Selected/Selected Hover only) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "32px",
            top: "102px",
            width: "128px",
            height: "128px",
            borderRadius: "50%",
            backgroundColor: iconColor,
            filter: "blur(40px)",
            opacity: s.glowOpacity,
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
                transition: "all 0.15s ease",
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
              transition: "all 0.15s ease",
            }}
          >
            {source.label}
          </span>
        </div>

        {/* Ellipse 867 — indicator dot top-right */}
        {s.showDot && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              right: "8px",
              top: "8px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: s.dotFill === "currentColor" ? accentColor : s.dotFill,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              transition: "all 0.15s ease",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
