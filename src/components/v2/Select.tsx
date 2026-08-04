"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getAssetPath, fetchSvgAsset } from "@/lib/utils";

/**
 * Compact dark dropdown, built on the module's existing tokens rather than a
 * component library: card surface `#111539`, control fill `#070a28`, the
 * `#646eca` active border the cards use, Inter at 14px.
 *
 * A native <select> was the cheaper option but renders an OS-styled popup that
 * breaks the dark canvas on the screen this module lives on.
 *
 * Widths are given as min-widths so the row can collapse on narrow viewports.
 */

export type SelectOption = {
  id: string;
  label: string;
  /** Icon name under public/assets/icons — stroke SVG, tinted by `accent`. */
  icon?: string;
  /** Raster logo path (e.g. a bank favicon) — shown on a white tile instead. */
  image?: string;
  /** Tile colour; the icon sits on this at ~15% opacity. */
  accent?: string;
  /** One-line subtitle under the label in the open list. */
  hint?: string;
  /** Listed but not selectable — rendered muted, skipped by the keyboard. */
  disabled?: boolean;
};

type Props = {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  minWidth?: number;
  disabled?: boolean;
};

const SURFACE = "#111539";
const NEUTRAL_ACCENT = "#9FA9FF";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Rounded colour-coded tile with the option's icon — the project icons stroke
 * with currentColor, so inlining the SVG (rather than an <img>) is what lets
 * the glyph take the accent colour.
 */
function OptionTile({
  icon,
  image,
  accent = NEUTRAL_ACCENT,
  size,
  iconSize,
  radius,
}: {
  icon?: string;
  image?: string;
  accent?: string;
  size: number;
  iconSize: number;
  radius: number;
}) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (!icon) return;
    let live = true;
    fetchSvgAsset(`/assets/icons/${icon}.svg`).then((t) => {
      if (live) setSvg(t);
    });
    return () => {
      live = false;
    };
  }, [icon]);

  // Brand logos keep their own colours, so they sit on a white tile the way
  // the benchmarking deck presents them — not on the accent tint.
  if (image) {
    return (
      <span
        aria-hidden
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={getAssetPath(image)}
          alt=""
          width={iconSize + 2}
          height={iconSize + 2}
          draggable={false}
          style={{ display: "block", objectFit: "contain" }}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: hexToRgba(accent, 0.15),
        color: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {svg && (
        <span
          style={{ width: iconSize, height: iconSize, display: "block", lineHeight: 0 }}
          dangerouslySetInnerHTML={{
            __html: svg.replace(
              /width="32"\s*height="32"/,
              `width="${iconSize}" height="${iconSize}"`
            ),
          }}
        />
      )}
    </span>
  );
}
const CONTROL_FILL = "#070a28";
const BORDER_IDLE = "rgba(255,255,255,0.12)";
const BORDER_HOVER = "rgba(159,169,255,0.55)";
const BORDER_OPEN = "rgba(100,110,202,1)";
const FONT = "var(--font-inter), Inter, system-ui, sans-serif";

export function Select({
  label,
  options,
  value,
  onChange,
  minWidth = 180,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.id === value)
  );
  const selected = options[selectedIndex];

  // Keep the highlight on the current value each time the list opens.
  useEffect(() => {
    if (open) setHighlight(selectedIndex);
  }, [open, selectedIndex]);

  // Close on outside pointer down and on scroll-away.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const commit = (index: number) => {
    const option = options[index];
    // A disabled option keeps the list open — nothing was chosen.
    if (option?.disabled) return;
    if (option) onChange(option.id);
    setOpen(false);
  };

  /** Next enabled index in `dir`, or `from` if there is none. */
  const step = (from: number, dir: 1 | -1) => {
    let i = from + dir;
    while (i >= 0 && i < options.length && options[i].disabled) i += dir;
    return i >= 0 && i < options.length ? i : from;
  };

  const firstEnabled = () => options.findIndex((o) => !o.disabled);
  const lastEnabled = () => {
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) return i;
    }
    return -1;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => step(h, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => step(h, -1));
        break;
      case "Home":
        e.preventDefault();
        setHighlight(Math.max(0, firstEnabled()));
        break;
      case "End":
        e.preventDefault();
        setHighlight(Math.max(0, lastEnabled()));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(highlight);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const borderColor = disabled
    ? "rgba(255,255,255,0.06)"
    : open
      ? BORDER_OPEN
      : hovered
        ? BORDER_HOVER
        : BORDER_IDLE;

  return (
    <div
      ref={rootRef}
      style={{ display: "flex", flexDirection: "column", gap: 6, minWidth }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {label}
      </span>

      <div style={{ position: "relative" }}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-label={label}
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: "100%",
            // Tile is 36 with an equal 6px inset on the left, top and bottom —
            // the same tile as the open list, not a shrunken copy of it.
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            // With a tile: 5px + 1px border = the same visual 6px inset the
            // vertical centring produces. Without one there is no tile to hug
            // the edge, so the label gets a normal 14px inset.
            padding:
              selected?.icon || selected?.image
                ? "6px 12px 6px 5px"
                : "6px 12px 6px 14px",
            borderRadius: 10,
            backgroundColor: CONTROL_FILL,
            border: `1px solid ${borderColor}`,
            cursor: disabled ? "not-allowed" : "pointer",
            outline: "none",
            transition: "border-color 0.15s ease",
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 500,
            lineHeight: "20px",
            color: disabled ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.95)",
            textAlign: "left",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
            }}
          >
            {(selected?.icon || selected?.image) && (
              <OptionTile
                icon={selected.icon}
                image={selected.image}
                accent={selected.accent}
                size={36}
                iconSize={20}
                radius={10}
              />
            )}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selected?.label ?? "—"}
            </span>
          </span>

          <motion.img
            src={getAssetPath("/assets/icons/ui-chevron-down.svg")}
            alt=""
            width={16}
            height={16}
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              flexShrink: 0,
              opacity: disabled ? 0.25 : 0.5,
              filter: "invert(1)",
            }}
          />
        </button>

        {/* Kept mounted on purpose.
            With AnimatePresence, an exit interrupted by a quick re-open leaves
            the panel in the DOM stuck at opacity 0 but `pointer-events: auto` —
            an invisible overlay under the selector that silently eats clicks.
            Presence is state here, so `pointerEvents` and `aria-hidden` are
            recomputed on every render and cannot get stuck. */}
        <motion.ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          aria-hidden={!open}
          initial={false}
          animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            // Wider than the trigger when the two-line rows need it — capped so
            // Payment System-length hints wrap the panel, not the screen.
            minWidth: "100%",
            width: "max-content",
            maxWidth: 340,
            zIndex: 60,
            margin: 0,
            padding: 4,
            listStyle: "none",
            borderRadius: 10,
            backgroundColor: SURFACE,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
              {options.map((option, i) => {
                const isSelected = option.id === value;
                const isHighlighted = i === highlight && !option.disabled;

                return (
                  <li key={option.id} style={{ listStyle: "none" }}>
                    {/* A real <button> rather than a clickable <li>: it lands in
                        the accessibility tree, takes focus, and responds to
                        Enter/Space natively. */}
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      // The combobox owns the tab stop; options are reached with
                      // the arrow keys, and must not be tabbable while closed.
                      tabIndex={-1}
                      onMouseEnter={
                        option.disabled ? undefined : () => setHighlight(i)
                      }
                      onClick={() => commit(i)}
                      onKeyDown={onKeyDown}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: 6,
                        cursor: option.disabled ? "default" : "pointer",
                        outline: "none",
                        textAlign: "left",
                        fontFamily: FONT,
                        fontSize: 14,
                        lineHeight: "20px",
                        color: option.disabled
                          ? "rgba(255,255,255,0.32)"
                          : isSelected
                            ? "rgba(255,255,255,0.98)"
                            : "rgba(255,255,255,0.7)",
                        backgroundColor: isHighlighted
                          ? "rgba(255,255,255,0.07)"
                          : "transparent",
                        transition: "background-color 0.12s ease",
                        // The tile and hint dim with the text, so the whole row
                        // reads as one disabled unit rather than a broken one.
                        opacity: option.disabled ? 0.75 : 1,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          minWidth: 0,
                        }}
                      >
                        {(option.icon || option.image) && (
                          <OptionTile
                            icon={option.icon}
                            image={option.image}
                            accent={option.accent}
                            size={36}
                            iconSize={20}
                            radius={10}
                          />
                        )}
                        <span
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {option.label}
                          </span>
                          {option.hint && (
                            <span
                              style={{
                                fontSize: 12,
                                lineHeight: "16px",
                                fontWeight: 400,
                                color: "rgba(255,255,255,0.4)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {option.hint}
                            </span>
                          )}
                        </span>
                      </span>

                      {isSelected && (
                        <img
                          src={getAssetPath("/assets/icons/ui-check.svg")}
                          alt=""
                          width={14}
                          height={14}
                          style={{
                            flexShrink: 0,
                            opacity: 0.9,
                            filter: "invert(1)",
                          }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
        </motion.ul>
      </div>
    </div>
  );
}
