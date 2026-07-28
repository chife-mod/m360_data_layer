"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getAssetPath } from "@/lib/utils";

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
    if (option) onChange(option.id);
    setOpen(false);
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
        setHighlight((h) => Math.min(h + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setHighlight(0);
        break;
      case "End":
        e.preventDefault();
        setHighlight(options.length - 1);
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
          fontWeight: 400,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
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
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "0 12px",
            borderRadius: 8,
            backgroundColor: CONTROL_FILL,
            border: `1px solid ${borderColor}`,
            cursor: disabled ? "not-allowed" : "pointer",
            outline: "none",
            transition: "border-color 0.15s ease",
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: "20px",
            color: disabled ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.92)",
            textAlign: "left",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selected?.label ?? "—"}
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
            right: 0,
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
                const isHighlighted = i === highlight;

                return (
                  <li key={option.id} style={{ listStyle: "none" }}>
                    {/* A real <button> rather than a clickable <li>: it lands in
                        the accessibility tree, takes focus, and responds to
                        Enter/Space natively. */}
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      // The combobox owns the tab stop; options are reached with
                      // the arrow keys, and must not be tabbable while closed.
                      tabIndex={-1}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => commit(i)}
                      onKeyDown={onKeyDown}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        height: 34,
                        padding: "0 10px",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        outline: "none",
                        textAlign: "left",
                        fontFamily: FONT,
                        fontSize: 14,
                        lineHeight: "20px",
                        color: isSelected
                          ? "rgba(255,255,255,0.98)"
                          : "rgba(255,255,255,0.7)",
                        backgroundColor: isHighlighted
                          ? "rgba(255,255,255,0.07)"
                          : "transparent",
                        transition: "background-color 0.12s ease",
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {option.label}
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
