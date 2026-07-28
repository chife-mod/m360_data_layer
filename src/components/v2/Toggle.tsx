"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  /** For demo: force visual state without affecting interaction */
  demoState?: "on" | "onHover" | "off" | "offHover";
};

// Figma node 306-1522: 60×32 track, 24×24 knob, borderRadius 40
const TRACK_WIDTH = 60;
const TRACK_HEIGHT = 32;
const TRACK_PADDING = 4;
const KNOB_SIZE = 24;
const KNOB_TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - KNOB_SIZE; // 28

const TRACK_FILL = "#070a28";
const KNOB_ON = "#ff46bb";
const KNOB_OFF = "#838383";
const GLOW_ON = "rgba(255, 70, 187, 0.15)";
const GLOW_ON_HOVER = "rgba(255, 70, 187, 0.3)";
const GLOW_OFF = "rgba(255, 255, 255, 0.1)";
const GLOW_OFF_HOVER = "rgba(255, 70, 187, 0.2)";

export function Toggle({
  checked,
  disabled = false,
  onChange,
  label,
  demoState,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const isOn = demoState
    ? demoState === "on" || demoState === "onHover"
    : checked;
  const isHover = demoState
    ? demoState === "onHover" || demoState === "offHover"
    : isHovered;

  const knobColor = isOn ? KNOB_ON : KNOB_OFF;
  const glowColor = isOn
    ? isHover
      ? GLOW_ON_HOVER
      : GLOW_ON
    : isHover
      ? GLOW_OFF_HOVER
      : GLOW_OFF;

  // Off = knob LEFT, On = knob RIGHT
  const knobX = isOn ? KNOB_TRAVEL : 0;

  const handleClick = () => {
    if (!disabled && onChange) onChange(!checked);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {label && (
        <span
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          }}
        >
          {label}
        </span>
      )}
      <motion.button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-disabled={disabled}
        onClick={demoState ? undefined : handleClick}
        disabled={!!demoState || disabled}
        onMouseEnter={demoState ? undefined : () => setIsHovered(true)}
        onMouseLeave={demoState ? undefined : () => setIsHovered(false)}
        whileHover={!disabled && !demoState ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !demoState ? { scale: 0.98 } : undefined}
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: 40,
          background: TRACK_FILL,
          border: "none",
          cursor: disabled || demoState ? "default" : "pointer",
          padding: TRACK_PADDING,
          position: "relative",
          display: "flex",
          alignItems: "center",
          outline: "none",
          overflow: "visible",
        }}
      >
        {/* Glow layer (40×40 ellipse, blur) - Figma Ellipse 3868 */}
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          style={{
            position: "absolute",
            left: TRACK_PADDING + (KNOB_SIZE - 40) / 2,
            top: TRACK_PADDING + (KNOB_SIZE - 40) / 2,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: glowColor,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            pointerEvents: "none",
          }}
          animate={{ x: knobX }}
        />
        {/* Knob (24×24) - Figma Frame 21224 */}
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            borderRadius: "50%",
            background: knobColor,
            position: "absolute",
            left: TRACK_PADDING,
          }}
          animate={{
            x: knobX,
          }}
        />
      </motion.button>
    </div>
  );
}
