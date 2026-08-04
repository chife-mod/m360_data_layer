/**
 * Shared card style definitions.
 * Single source of truth — used by both card-demo page and DataCard component.
 * Edit here → updates everywhere automatically.
 */

export type CardStyleState =
    | "default"
    | "hover"
    | "active"
    | "activeHover"
    | "selected"
    | "selectedHover"
    | "disabled"
    | "disabledHover"
    | "disabledSelected";

export type CardStyleDef = {
    bg: string;
    borderType: "gradient" | "solid" | "none";
    borderStyle?: "solid" | "dashed" | "dotted";
    borderColor?: string;
    gradientStops?: string;
    borderWidth: number;
    shadow: string;
    glowOpacity: number;
    showCornerGlow: boolean;
    cornerGlowOpacity: number;
    iconOpacity: number;
    iconStrokeWidth: number;
    textOpacity: number;
    dotFill: string;
    showDot: boolean;
};

export const cardStyles: Record<CardStyleState, CardStyleDef> = {
    default: {
        bg: "rgba(17, 21, 57, 1)",
        borderType: "gradient",
        gradientStops: "rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.18) 100%",
        borderWidth: 1,
        shadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        glowOpacity: 0,
        showCornerGlow: true,
        cornerGlowOpacity: 0.15,
        iconOpacity: 0.4,
        iconStrokeWidth: 2,
        textOpacity: 0.7,
        dotFill: "transparent",
        showDot: true,
    },
    hover: {
        bg: "rgba(17, 21, 57, 1)",
        borderType: "gradient",
        gradientStops: "rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 100%",
        borderWidth: 1,
        shadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        glowOpacity: 0,
        showCornerGlow: true,
        cornerGlowOpacity: 0.22,
        iconOpacity: 0.4,
        iconStrokeWidth: 2,
        textOpacity: 0.7,
        dotFill: "transparent",
        showDot: true,
    },
    active: {
        bg: "rgba(17, 21, 57, 1)",
        borderType: "solid",
        borderColor: "rgba(100, 110, 202, 1)",
        borderWidth: 1,
        shadow: "inset 0 -2px 18px rgba(100, 110, 202, 0.6)",
        glowOpacity: 0,
        showCornerGlow: true,
        cornerGlowOpacity: 0.22,
        iconOpacity: 0.4,
        iconStrokeWidth: 2,
        textOpacity: 0.7,
        dotFill: "transparent",
        showDot: true,
    },
    activeHover: {
        bg: "rgba(17, 21, 57, 1)",
        borderType: "solid",
        borderColor: "rgba(159, 169, 255, 1)",
        borderWidth: 1,
        shadow: "inset 0 -2px 18px rgba(100, 110, 202, 0.6)",
        glowOpacity: 0,
        showCornerGlow: true,
        cornerGlowOpacity: 0.22,
        iconOpacity: 0.4,
        iconStrokeWidth: 2,
        textOpacity: 0.7,
        dotFill: "transparent",
        showDot: true,
    },
    selected: {
        bg: "rgba(17, 21, 57, 1)",
        borderType: "solid",
        borderColor: "rgba(100, 110, 202, 1)",
        borderWidth: 1,
        shadow: "inset 0 -2px 18px rgba(100, 110, 202, 0.6)",
        glowOpacity: 0.8,
        showCornerGlow: true,
        cornerGlowOpacity: 0.22,
        iconOpacity: 1,
        iconStrokeWidth: 2,
        textOpacity: 1,
        dotFill: "currentColor",
        showDot: true,
    },
    selectedHover: {
        bg: "rgba(17, 21, 57, 1)",
        borderType: "solid",
        borderColor: "rgba(159, 169, 255, 1)",
        borderWidth: 1,
        shadow: "inset 0 -2px 18px rgba(100, 110, 202, 0.6)",
        glowOpacity: 0.8,
        showCornerGlow: true,
        cornerGlowOpacity: 0.22,
        iconOpacity: 1,
        iconStrokeWidth: 2,
        textOpacity: 1,
        dotFill: "currentColor",
        showDot: true,
    },
    disabled: {
        bg: "transparent",
        borderType: "solid",
        borderStyle: "dotted",
        borderColor: "rgba(58, 64, 120, 0.5)",
        borderWidth: 2,
        shadow: "none",
        glowOpacity: 0,
        showCornerGlow: false,
        cornerGlowOpacity: 0,
        iconOpacity: 0.2,
        iconStrokeWidth: 1,
        textOpacity: 0.2,
        dotFill: "transparent",
        showDot: false,
    },
    // A disabled tile under the cursor. Disabled tiles are clickable
    // (2026-08-04): in LLM mode the click explains WHY the dataset is out; on
    // a busy board it starts a fresh selection. The border answers the hover,
    // nothing else does.
    disabledHover: {
        bg: "transparent",
        borderType: "solid",
        borderStyle: "dotted",
        borderColor: "rgba(100, 110, 202, 0.65)",
        borderWidth: 2,
        shadow: "none",
        glowOpacity: 0,
        showCornerGlow: false,
        cornerGlowOpacity: 0,
        iconOpacity: 0.3,
        iconStrokeWidth: 1,
        textOpacity: 0.3,
        dotFill: "transparent",
        showDot: false,
    },
    // Chosen while unavailable (LLM mode): the same dotted stroke, just
    // brighter, and deliberately NO inner glow — the tile is picked, not lit
    // ("чуть-чуть ярче… но без внутреннего освещения", 2026-08-04).
    disabledSelected: {
        bg: "transparent",
        borderType: "solid",
        borderStyle: "dotted",
        borderColor: "rgba(159, 169, 255, 0.8)",
        borderWidth: 2,
        shadow: "none",
        glowOpacity: 0,
        showCornerGlow: false,
        cornerGlowOpacity: 0,
        iconOpacity: 0.5,
        iconStrokeWidth: 1,
        textOpacity: 0.55,
        dotFill: "transparent",
        showDot: false,
    },
};
