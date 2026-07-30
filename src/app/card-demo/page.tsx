"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getAssetPath, fetchSvgAsset } from "@/lib/utils";
import { cardStyles as baseStyles, type CardStyleDef } from "@/lib/card-styles";

const GREEN = "rgba(70, 254, 195, 1)";
const WHITE = "rgba(255,255,255,1)";

const STATES = [
  "Default",
  "Hover",
  "Active",
  "Active Hover",
  "Selected",
  "Selected Hover",
  "Disable",
] as const;

type CardState = (typeof STATES)[number];

const stateFileMap: Record<CardState, string> = {
  Default: "default",
  Hover: "hover",
  Active: "active",
  "Active Hover": "active-hover",
  Selected: "selected",
  "Selected Hover": "selected-hover",
  Disable: "disable",
};

// card-demo extends the shared base styles with display colors
// (iconColor, textColor, glowColor are card-demo specific — in DataCard they're computed dynamically)
type S = CardStyleDef & {
  glowColor: string;
  iconColor: string;
  textColor: string;
};

// Base styles come from @/lib/card-styles — single source of truth.
// Only color overrides are defined here (display-specific for the demo page).
const cardStyles: Record<CardState, S> = {
  Default: { ...baseStyles.default, glowColor: GREEN, iconColor: WHITE, textColor: WHITE },
  Hover: { ...baseStyles.hover, glowColor: GREEN, iconColor: WHITE, textColor: WHITE },
  Active: { ...baseStyles.active, glowColor: GREEN, iconColor: WHITE, textColor: WHITE },
  "Active Hover": { ...baseStyles.activeHover, glowColor: GREEN, iconColor: WHITE, textColor: WHITE },
  Selected: { ...baseStyles.selected, glowColor: GREEN, iconColor: GREEN, textColor: GREEN },
  "Selected Hover": { ...baseStyles.selectedHover, glowColor: GREEN, iconColor: GREEN, textColor: GREEN },
  Disable: { ...baseStyles.disabled, glowColor: GREEN, iconColor: WHITE, textColor: WHITE },
};

// ─── Single card renderer ─────────────────────────────────────────────────────

function CardImpl({ state, iconSvg }: { state: CardState; iconSvg: string }) {
  const s = cardStyles[state];
  const processed = iconSvg
    ? iconSvg.replace(/stroke-width="[^"]+"/g, `stroke-width="${s.iconStrokeWidth}"`)
    : "";

  return (
    <div
      style={{
        position: "relative",
        width: 191,
        height: 130,
        backgroundColor: s.bg,
        borderRadius: 12,
        border:
          s.borderType === "solid"
            ? `${s.borderWidth}px ${s.borderStyle ?? "solid"} ${s.borderColor}`
            : "none",
        boxShadow: s.shadow === "none" ? undefined : s.shadow,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Gradient border */}
      {s.borderType === "gradient" && (
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: 12,
            padding: `${s.borderWidth}px`,
            background: `linear-gradient(180deg, ${s.gradientStops})`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}

      {/* Corner glow TL */}
      {s.showCornerGlow && (
        <div style={{
          position: "absolute", left: -46, top: -46, width: 92, height: 92,
          borderRadius: "50%", backgroundColor: `rgba(255,255,255,${s.cornerGlowOpacity})`,
          filter: "blur(40px)", pointerEvents: "none",
        }} />
      )}
      {/* Corner glow BR */}
      {s.showCornerGlow && (
        <div style={{
          position: "absolute", right: -46, bottom: -46, width: 92, height: 92,
          borderRadius: "50%", backgroundColor: `rgba(255,255,255,${s.cornerGlowOpacity})`,
          filter: "blur(40px)", pointerEvents: "none",
        }} />
      )}

      {/* Bottom glow */}
      <div style={{
        position: "absolute", left: 32, top: 102, width: 128, height: 128,
        borderRadius: "50%", backgroundColor: s.iconColor,
        filter: "blur(40px)", opacity: s.glowOpacity,
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24, gap: 12,
      }}>
        {processed && (
          <div
            style={{ width: 32, height: 32, opacity: s.iconOpacity, color: s.iconColor, flexShrink: 0 }}
            dangerouslySetInnerHTML={{ __html: processed }}
          />
        )}
        <span style={{
          fontSize: 14, fontWeight: 400, lineHeight: "19.6px",
          color: s.textColor, opacity: s.textOpacity,
          whiteSpace: "nowrap",
          fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        }}>
          Brands
        </span>
      </div>

      {/* Indicator dot */}
      {s.showDot && (
        <div style={{
          position: "absolute", right: 8, top: 8,
          width: 12, height: 12, borderRadius: "50%",
          backgroundColor: s.dotFill,
          border: "1px solid rgba(255,255,255,0.2)",
          zIndex: 10, pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardDemoPage() {
  const [iconSvg, setIconSvg] = useState("");

  useEffect(() => {
    fetchSvgAsset("/assets/icons/brands.svg").then(setIconSvg);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111539",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        padding: "64px 0 80px",
        overflowX: "hidden",
      }}
    >
      {/* ── Page header ── */}
      <div style={{ maxWidth: 880, margin: "0 auto 48px", padding: "0 40px" }}>
        <h1 style={{
          fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.9)",
          margin: "0 0 8px", letterSpacing: "-0.02em",
        }}>
          Card States
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
          Figma reference vs. CSS implementation · all 7 states
        </p>
      </div>

      {/* ── Column headers ── */}
      <div style={{
        maxWidth: 880, margin: "0 auto 16px", padding: "0 40px",
        display: "grid",
        gridTemplateColumns: "120px 191px 64px 191px",
        alignItems: "center",
        gap: 0,
      }}>
        <div />
        <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Figma
        </span>
        <div />
        <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Code
        </span>
      </div>

      {/* ── Divider ── */}
      <div style={{ maxWidth: 880, margin: "0 auto 0", padding: "0 40px" }}>
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.05)" }} />
      </div>

      {/* ── Rows ── */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px" }}>
        {STATES.map((state, i) => (
          <div
            key={state}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 191px 64px 191px",
              alignItems: "center",
              gap: 0,
              padding: "20px 0",
              borderBottom: i < STATES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            {/* State label */}
            <span style={{
              fontSize: 12, fontWeight: 400,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.01em",
            }}>
              {state}
            </span>

            {/* Figma ref */}
            <Image
              src={getAssetPath(`/assets/card-states/${stateFileMap[state]}.png`)}
              alt={state}
              width={191}
              height={130}
              style={{ borderRadius: 12, display: "block" }}
              unoptimized
            />

            {/* Diff arrow */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* CSS impl */}
            <CardImpl state={state} iconSvg={iconSvg} />
          </div>
        ))}
      </div>
    </div>
  );
}
