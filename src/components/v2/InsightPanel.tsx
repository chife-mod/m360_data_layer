"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { SignalConfig } from "@/lib/v2/signals-data";
import { getInsightDescription } from "@/lib/v2/signals-data";
import { getAssetPath, fetchSvgAsset } from "@/lib/utils";
import { getUseCaseGroups, resolveTitle, PUMB_MONTHLY_PULSE } from "@/lib/v2/use-cases";
import { Select } from "./Select";
import { PeriodPicker, type Period } from "./PeriodPicker";
import type { UseCase } from "@/lib/v2/use-cases";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function useIconSvg(iconName: string) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let live = true;
    fetchSvgAsset(`/assets/icons/${iconName}.svg`).then((t) => {
      if (live) setSvg(t);
    });
    return () => {
      live = false;
    };
  }, [iconName]);
  return svg;
}

/**
 * Drag-to-scroll for the report preview strip — grab it and throw it sideways,
 * the way a finger works on a tablet.
 *
 * Three things this has to get right, each of which broke a naive version:
 *   - The pages are <a> elements, and anchors are natively draggable, so
 *     mousedown-and-move starts the browser's own link drag and the gesture
 *     never reaches us. `dragstart` is cancelled.
 *   - Move and release are listened for on the window, not the strip, so the
 *     drag survives the pointer leaving the strip.
 *   - The active flag lives in a ref. Read from state it goes stale inside the
 *     listener closure and every move is ignored.
 *
 * Scroll-snap is suspended while dragging or it pulls the strip back on every
 * move, and the click that ends a drag is swallowed so a swipe does not open
 * whichever page the pointer happened to stop on.
 */
function useDragScroll() {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const st = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  useEffect(() => {
    if (!node) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      st.current = {
        active: true,
        startX: e.clientX,
        startScroll: node.scrollLeft,
        moved: false,
      };
      setDragging(true);
    };

    const onMove = (e: PointerEvent) => {
      if (!st.current.active) return;
      const dx = e.clientX - st.current.startX;
      if (Math.abs(dx) > 3) st.current.moved = true;
      node.scrollLeft = st.current.startScroll - dx;
      e.preventDefault();
    };

    const onUp = () => {
      if (!st.current.active) return;
      st.current.active = false;
      setDragging(false);
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!st.current.moved) return;
      e.preventDefault();
      e.stopPropagation();
      st.current.moved = false;
    };

    const onDragStart = (e: Event) => e.preventDefault();

    node.addEventListener("pointerdown", onDown);
    node.addEventListener("click", onClickCapture, true);
    node.addEventListener("dragstart", onDragStart);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      node.removeEventListener("pointerdown", onDown);
      node.removeEventListener("click", onClickCapture, true);
      node.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [node]);

  return { setNode, dragging };
}

const BAR_COUNT = 15;

const HEIGHT_SETS: Record<number, number[]> = {
  0: Array(BAR_COUNT).fill(0),
  1: [28, 52, 44, 72, 36, 88, 48, 64, 32, 76, 56, 40, 68, 96, 112],
  2: [17, 48, 87, 36, 73, 52, 28, 69, 20, 48, 84, 42, 73, 104, 119],
  3: [48, 72, 36, 96, 28, 64, 52, 88, 40, 80, 56, 32, 72, 108, 119],
};

function SignalBarChart({
  selectedSignals,
}: {
  selectedSignals: SignalConfig[];
}) {
  const count = selectedSignals.length;
  const heights = HEIGHT_SETS[Math.min(count, 3)];

  return (
    <>
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const signal = count > 0 ? selectedSignals[i % count] : null;
        const color = signal?.color ?? "transparent";
        const height = heights[i];

        return (
          <motion.div
            key={i}
            animate={{ height, opacity: count > 0 ? 1 : 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{
              height: {
                type: "spring",
                stiffness: 200,
                damping: 22,
                delay: i * 0.028,
              },
              opacity: { duration: 0.3, delay: i * 0.025 },
            }}
            style={{
              flex: "1 0 0",
              minWidth: 0,
              minHeight: 0,
              position: "relative",
              background:
                count > 0
                  ? `linear-gradient(to bottom, ${hexToRgba(color, 0.12)}, transparent)`
                  : "transparent",
              transition: "background 0.45s ease",
            }}
          >
            {count > 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 1,
                  background: `linear-gradient(to bottom, ${hexToRgba(color, 0.2)}, transparent)`,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  pointerEvents: "none",
                  transition: "background 0.45s ease",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </>
  );
}

function SignalIconBadge({
  signal,
  index,
}: {
  signal: SignalConfig;
  index: number;
}) {
  const svg = useIconSvg(signal.icon);

  return (
    <motion.div
      layout
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 350, damping: 28 },
        scale: { type: "spring", stiffness: 400, damping: 22 },
        opacity: { duration: 0.18 },
        delay: index * 0.05,
      }}
      // Dark rounded tile rather than a bare glowing glyph — the naked 64px
      // icons read cartoonish next to the data. The accent stays on the stroke,
      // so the colour link to the board survives.
      style={{
        position: "relative",
        width: 52,
        height: 52,
        flexShrink: 0,
        borderRadius: 14,
        backgroundColor: "rgba(7,10,40,0.55)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {svg && (
        <div
          style={{
            width: 26,
            height: 26,
            color: signal.color,
            lineHeight: 0,
          }}
          dangerouslySetInnerHTML={{
            __html: svg
              .replace(/width="32"\s*height="32"/, 'width="26" height="26"')
              .replace(/viewBox="[^"]*"/, 'viewBox="0 0 32 32"'),
          }}
        />
      )}
    </motion.div>
  );
}

/** Role chips, the way the brief writes them: [MARKETING] [PR] [CX]. */
function RoleTags({ roles }: { roles: string[] }) {
  return (
    <>
      {roles.map((r) => (
        <span
          key={r}
          style={{
            fontSize: 10,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 4,
            padding: "2px 6px",
            whiteSpace: "nowrap",
          }}
        >
          {r}
        </span>
      ))}
    </>
  );
}

/**
 * InlineLink's button twin — runs a handler instead of navigating.
 * `primary` is the one filled button in a row of outlined ones: Build Report
 * is the action, the links are destinations.
 */
function InlineActionButton({
  label,
  icon,
  onClick,
  primary = false,
  height = 32,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  primary?: boolean;
  height?: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height,
        padding: "0 14px",
        borderRadius: 8,
        border: primary
          ? "1px solid transparent"
          : `1px solid ${
              hovered ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)"
            }`,
        backgroundColor: primary
          ? hovered
            ? "#ffffff"
            : "rgba(255,255,255,0.92)"
          : hovered
            ? "rgba(255,255,255,0.07)"
            : "transparent",
        fontSize: 13,
        fontWeight: primary ? 500 : 400,
        lineHeight: 1,
        color: primary
          ? "#0b0e2b"
          : hovered
            ? "rgba(255,255,255,0.98)"
            : "rgba(255,255,255,0.75)",
        cursor: "pointer",
        outline: "none",
        transition:
          "color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <img
        src={getAssetPath(`/assets/icons/${icon}.svg`)}
        alt=""
        width={16}
        height={16}
        draggable={false}
        style={{
          // The icon strokes with currentColor, which renders black inside an
          // <img>; inverting it makes it white for the outlined variant and is
          // exactly wrong on the light primary fill.
          filter: primary ? "none" : "invert(1)",
          opacity: primary ? 0.85 : hovered ? 0.95 : 0.6,
          transition: "opacity 0.15s ease",
        }}
      />
      {label}
    </button>
  );
}

/**
 * One Job to be Done, in the client's own field order:
 * Role | Job | Dataset | Parameters | AI Report Template.
 */
function InlineLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Without this the click would bubble to the card and open the popup as
      // well — the point is that the link is a separate destination.
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 32,
        padding: "0 14px",
        borderRadius: 8,
        border: `1px solid ${
          hovered ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)"
        }`,
        backgroundColor: hovered ? "rgba(255,255,255,0.07)" : "transparent",
        fontSize: 13,
        lineHeight: 1,
        textDecoration: "none",
        color: hovered ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.75)",
        transition:
          "color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      <img
        src={getAssetPath(`/assets/icons/${icon}.svg`)}
        alt=""
        width={16}
        height={16}
        draggable={false}
        style={{
          filter: "invert(1)",
          opacity: hovered ? 0.95 : 0.6,
          transition: "opacity 0.15s ease",
        }}
      />
      {label}
      <span style={{ opacity: 0.45, fontSize: 11 }}>↗</span>
    </a>
  );
}

/**
 * One Task / App, in the client's field order:
 * Role | Title | Overview | Report Template | Dashboard.
 *
 * A div rather than a button: the card itself opens the popup, but the report
 * and dashboard links inside it are their own destinations, and an anchor
 * nested in a button is invalid. Keyboard behaviour is restored by hand.
 */
function UseCaseCard({
  useCase,
  title,
  onClick,
  onBuildReport,
}: {
  useCase: UseCase;
  title: string;
  onClick: () => void;
  onBuildReport: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const font = "var(--font-inter), Inter, system-ui, sans-serif";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
        width: "100%",
        padding: 16,
        borderRadius: 10,
        textAlign: "left",
        cursor: "pointer",
        outline: "none",
        backgroundColor: hovered
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${
          hovered ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)"
        }`,
        transition: "background-color 0.15s ease, border-color 0.15s ease",
        fontFamily: font,
      }}
    >
      {/* Roles as chips, per the brief's own notation. Grey, not accent.
          The draft chip survives only on placeholder apps, so filler is still
          obvious at a glance. */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <RoleTags roles={useCase.roles} />
        {!useCase.authored && (
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 4,
              padding: "1px 5px",
            }}
          >
            draft
          </span>
        )}
      </div>

      <span style={{ fontSize: 15, lineHeight: 1.35, color: "rgba(255,255,255,0.95)" }}>
        {title}
      </span>

      {/* Absent overview is hidden rather than printed as N/A — the client's
          own option, and "N/A" on screen reads as unfinished during a demo. */}
      {useCase.overview && (
        <span style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.45)" }}>
          {useCase.overview}
        </span>
      )}

      {/* Brief of 2026-07-30: Build Report | Report Templates | Dashboard,
          Build Report first. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 2,
        }}
      >
        <InlineActionButton
          label="Build Report"
          icon="ui-build"
          onClick={onBuildReport}
          primary
        />
        {useCase.reportTemplateUrl && (
          <InlineLink
            href={useCase.reportTemplateUrl}
            label="Report Templates"
            icon="ui-report-template"
          />
        )}
        {useCase.dashboardUrl && (
          <InlineLink
            href={useCase.dashboardUrl}
            label="Dashboard"
            icon="ui-dashboard"
          />
        )}
      </div>
    </div>
  );
}

/** Opens the client's report template / dashboard in a new tab. */
function LinkButton({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 40,
        padding: "0 18px",
        borderRadius: 8,
        border: `1px solid ${
          hovered ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.18)"
        }`,
        backgroundColor: hovered ? "rgba(255,255,255,0.05)" : "transparent",
        color: "white",
        fontSize: 14,
        textDecoration: "none",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
      }}
    >
      {label}
      <span style={{ opacity: 0.5, fontSize: 12 }}>↗</span>
    </a>
  );
}

/**
 * A single job, opened from the Apps list.
 *
 * Centred page-level modal rather than a panel-sized popup or a right-hand
 * drawer. The subject here is the artifact — what the finished AI report looks
 * like — and that needs real width; inside the 515px panel it reads as a
 * thumbnail. A drawer is for content you compare against what is behind it,
 * but nothing behind this matters, and sliding one in from the right would
 * read as the insight panel swelling.
 *
 * Portalled to <body>: the panel clips its overflow and framer's transforms
 * would trap a `position: fixed` child, so neither can host it.
 */
function JobPopup({
  useCase,
  title,
  accent,
  datalakeLabel,
  onClose,
  onBuildReport,
}: {
  useCase: UseCase;
  title: string;
  accent: string;
  datalakeLabel: string;
  onClose: () => void;
  onBuildReport: () => void;
}) {
  const font = "var(--font-inter), Inter, system-ui, sans-serif";
  const [mounted, setMounted] = useState(false);
  const strip = useDragScroll();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Scroll-lock so the page behind cannot move while the modal is up.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 15, lineHeight: 1.45, color: "rgba(255,255,255,0.92)" }}>
        {value}
      </span>
    </div>
  );

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(4, 6, 24, 0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        fontFamily: font,
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 16, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.99 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(960px, 100%)",
          maxHeight: "85vh",
          backgroundColor: "#111539",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 16,
          boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header — stays put while the body scrolls */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            padding: "28px 32px 20px 32px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: accent,
                }}
              >
                {datalakeLabel}
              </span>
              <RoleTags roles={useCase.roles} />
              {!useCase.authored && (
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 4,
                    padding: "1px 5px",
                  }}
                >
                  draft
                </span>
              )}
            </div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.2,
                color: "white",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              outline: "none",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          className="m360-scroll"
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            padding: "24px 32px 32px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {useCase.overview && <Field label="Overview" value={useCase.overview} />}

          {/* One primary action, outlined destinations after it — same row
              and order as the card: Build Report | Report Templates | Dashboard. */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <InlineActionButton
              label="Build Report"
              icon="ui-build"
              onClick={onBuildReport}
              primary
              height={40}
            />
            {useCase.reportTemplateUrl && (
              <LinkButton href={useCase.reportTemplateUrl} label="Report Templates" />
            )}
            {useCase.dashboardUrl && (
              <LinkButton href={useCase.dashboardUrl} label="Dashboard" />
            )}
          </div>

          {/* The artifact itself — the whole reason this modal is large.
              The strip sits inside the body's 32px gutters on both sides — it
              used to bleed past the right edge, which also ran its scrollbar
              into the modal's corner. A cut-off page peeking at the edge still
              signals there is more. Pages are captured stills rather than live
              iframes: a dozen iframes each booting the whole report would make
              the popup crawl. */}
          {useCase.reportPreview ? (
            // minWidth:0 on both this wrapper and the strip: as flex items they
            // default to min-width:auto, so instead of overflowing they grow to
            // fit 12 pages and overflow-x never engages — the strip looked right
            // but had nothing to scroll, so dragging it did nothing.
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  Report preview
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                  {useCase.reportPreview.count} pages · scroll →
                </span>
              </div>

              <div
                className="m360-scroll"
                ref={strip.setNode}
                style={{
                  display: "flex",
                  gap: 12,
                  minWidth: 0,
                  overflowX: "auto",
                  paddingBottom: 14,
                  // Snap fights the drag, so it only applies once the pointer
                  // is off the strip.
                  scrollSnapType: strip.dragging ? "none" : "x mandatory",
                  cursor: strip.dragging ? "grabbing" : "grab",
                  userSelect: "none",
                  touchAction: "pan-x",
                }}
              >
                {Array.from(
                  { length: useCase.reportPreview.count },
                  (_, i) => {
                    const n = String(i + 1).padStart(2, "0");
                    const src = getAssetPath(
                      `/assets/reports/${useCase.reportPreview!.dir}/slide-${n}.png`
                    );
                    return (
                      <a
                        key={n}
                        href={useCase.reportTemplateUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        draggable={false}
                        style={{
                          flex: "0 0 auto",
                          scrollSnapAlign: "start",
                          display: "block",
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.1)",
                          lineHeight: 0,
                        }}
                      >
                        <img
                          src={src}
                          alt={`Page ${i + 1}`}
                          // The first few are visible the moment the popup
                          // opens; lazy-loading them shows an empty strip first.
                          loading={i < 3 ? "eager" : "lazy"}
                          draggable={false}
                          style={{ height: 232, width: "auto", display: "block" }}
                        />
                      </a>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                Report preview
              </span>
              <div
                style={{
                  minHeight: 200,
                  borderRadius: 12,
                  border: "1px dashed rgba(255,255,255,0.14)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.28)",
                  fontSize: 14,
                  padding: 32,
                }}
              >
                No report template for this app yet
              </div>
            </div>
          )}

          {!useCase.authored && (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              Draft — placeholder text, awaiting the real job description.
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/**
 * Build Report — brief of 2026-07-30: "похожий диалог, но с тремя параметрами
 * и кнопочкой". Same modal chrome as the template popup, three parameters
 * (Bank / Period / Language), one button. Prototype behaviour: Build opens the
 * app's report in a new tab, standing in for the real build pipeline.
 *
 * ⚠️ The option lists are demo data chosen by me, not by the client.
 */
const BUILDER_BANKS = [
  { id: "PUMB", label: "PUMB", image: "/assets/banks/pumb.png" },
  { id: "PrivatBank", label: "PrivatBank", image: "/assets/banks/privatbank.png" },
  { id: "Oschadbank", label: "Oschadbank", image: "/assets/banks/oschadbank.png" },
  { id: "Monobank", label: "Monobank", image: "/assets/banks/monobank.png" },
  { id: "Raiffeisen Bank", label: "Raiffeisen Bank", image: "/assets/banks/raiffeisen.png" },
  { id: "UKRSIBBANK", label: "UKRSIBBANK", image: "/assets/banks/ukrsibbank.png" },
];

/** Default period: last full month. */
function lastMonth(): Period {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    to: new Date(now.getFullYear(), now.getMonth(), 0),
  };
}

const BUILDER_LANGUAGES = [
  { id: "en", label: "English" },
  { id: "uk", label: "Українська" },
];

function BuildReportPopup({
  useCase,
  title,
  accent,
  datalakeLabel,
  onClose,
}: {
  useCase: UseCase;
  title: string;
  accent: string;
  datalakeLabel: string;
  onClose: () => void;
}) {
  const font = "var(--font-inter), Inter, system-ui, sans-serif";
  const [mounted, setMounted] = useState(false);
  const [bank, setBank] = useState(BUILDER_BANKS[0].id);
  const [period, setPeriod] = useState<Period>(lastMonth);
  const [language, setLanguage] = useState(BUILDER_LANGUAGES[0].id);
  const [buildHovered, setBuildHovered] = useState(false);
  // A backdrop click while the period panel is open must close only the
  // panel, not the whole popup — dismissing a calendar should never cost the
  // user the dialog. The panel closes itself on that same pointerdown; this
  // pair of refs makes the overlay swallow the click that follows.
  const pickerOpenRef = useRef(false);
  const swallowCloseRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const build = () => {
    // Stand-in for the real pipeline: "building" opens the PUMB Monthly
    // Pulse — the one finished single-bank report that exists, i.e. exactly
    // what these parameters would have produced.
    window.open(PUMB_MONTHLY_PULSE, "_blank", "noopener,noreferrer");
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onPointerDownCapture={() => {
        if (pickerOpenRef.current) swallowCloseRef.current = true;
      }}
      onClick={() => {
        if (swallowCloseRef.current) {
          swallowCloseRef.current = false;
          return;
        }
        onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(4, 6, 24, 0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        fontFamily: font,
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Build report — ${title}`}
        initial={{ opacity: 0, y: 16, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.99 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          backgroundColor: "#111539",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 16,
          boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            padding: "24px 28px 18px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {datalakeLabel} · {title}
            </span>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.2,
                color: "white",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Build Report
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              outline: "none",
            }}
          >
            ×
          </button>
        </div>

        {/* Parameters */}
        <div
          style={{
            padding: "20px 28px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Select
            label="Bank"
            options={BUILDER_BANKS}
            value={bank}
            onChange={setBank}
          />
          <PeriodPicker
            label="Period"
            value={period}
            onChange={setPeriod}
            onOpenChange={(o) => {
              pickerOpenRef.current = o;
            }}
          />
          <Select
            label="Language"
            options={BUILDER_LANGUAGES}
            value={language}
            onChange={setLanguage}
          />

          <button
            type="button"
            onClick={build}
            onMouseEnter={() => setBuildHovered(true)}
            onMouseLeave={() => setBuildHovered(false)}
            style={{
              marginTop: 8,
              height: 44,
              borderRadius: 8,
              border: "1px solid transparent",
              backgroundColor: buildHovered ? "#ffffff" : "rgba(255,255,255,0.92)",
              color: "#0b0e2b",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
              transition: "background-color 0.15s ease",
              fontFamily: font,
            }}
          >
            Build Report
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

type Props = {
  selectedSignals: SignalConfig[];
  singleSelect?: boolean;
  /**
   * Copy for the current combination. Supplied by the page because it depends
   * on the active datalake set (watches / banking), which this panel does not
   * know about. Falls back to the watches lookup when omitted.
   */
  description?: string;
  /** Which datalake set is active — needed to look up apps. */
  setId?: string;
  /** Current Type selector label — some app titles depend on it. */
  typeLabel?: string;
};

export function InsightPanel({
  selectedSignals,
  singleSelect = false,
  description: descriptionProp,
  setId = "watches",
  typeLabel = "",
}: Props) {
  const count = selectedSignals.length;
  const description =
    descriptionProp ?? getInsightDescription(selectedSignals.map((s) => s.id));

  const [activeTab, setActiveTab] = useState<"overview" | "apps">("overview");
  const [openJob, setOpenJob] = useState<{
    useCase: UseCase;
    accent: string;
    datalakeLabel: string;
  } | null>(null);
  const [openBuilder, setOpenBuilder] = useState<{
    useCase: UseCase;
    accent: string;
    datalakeLabel: string;
  } | null>(null);

  // A popup for a job that is no longer on screen would be orphaned.
  useEffect(() => {
    setOpenJob(null);
    setOpenBuilder(null);
  }, [activeTab, count]);

  // A job list for tiles that are no longer selected would be nonsense.
  useEffect(() => {
    if (count === 0) setActiveTab("overview");
  }, [count]);

  const useCaseGroups = getUseCaseGroups(setId, selectedSignals);

  return (
    <div
      style={{
        width: 515,
        height: 532,
        backgroundColor: "#111539",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -0.5,
          borderRadius: "inherit",
          boxShadow:
            "inset 0px -12px 44.7px 0px rgba(255, 255, 255, 0.09)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      <AnimatePresence>
        {count === 0 && (
          <motion.div
            key="empty-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: 32,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 32 32"
              fill="none"
              style={{ opacity: 0.4, overflow: "visible", flexShrink: 0 }}
            >
              <path
                d="M17.6667 7.66667C18.5336 7.437 19.379 7.13253 20.1933 6.75667C21.7117 6.02667 22.6833 5.065 23.4217 3.53667C23.7667 2.82333 24.0583 1.99 24.3333 1C24.6083 1.99167 24.9 2.825 25.245 3.535C25.9833 5.065 26.955 6.02667 28.4733 6.75667C29.1833 7.09833 30.015 7.39 31 7.66667C30.133 7.89687 29.2876 8.2019 28.4733 8.57833C26.955 9.30833 25.9833 10.27 25.245 11.7983C24.8657 12.6143 24.5606 13.4627 24.3333 14.3333C24.0583 13.3433 23.7667 12.5083 23.4217 11.7983C22.6833 10.2683 21.7117 9.30833 20.1933 8.57833C19.3801 8.19949 18.5345 7.89438 17.6667 7.66667ZM1 19.3333C1.9296 19.0758 2.84817 18.78 3.75333 18.4467C7.99 16.8583 10.175 14.7167 11.78 10.4367C12.1157 9.52667 12.4116 8.60246 12.6667 7.66667C12.9218 8.60246 13.2176 9.52667 13.5533 10.4367C15.1583 14.715 17.345 16.8583 21.58 18.4467C22.4133 18.7578 23.3311 19.0533 24.3333 19.3333C23.4037 19.5908 22.4852 19.8866 21.58 20.22C17.3433 21.8083 15.1567 23.95 13.5533 28.23C13.2176 29.14 12.9218 30.0642 12.6667 31C12.4116 30.0642 12.1157 29.14 11.78 28.23C10.175 23.95 7.98833 21.8083 3.75333 20.22C2.84817 19.8866 1.9296 19.5908 1 19.3333Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p
              style={{
                fontSize: 24,
                fontWeight: 400,
                lineHeight: 1.3,
                color: "white",
                opacity: 0.8,
                textAlign: "center",
                width: 318,
                fontFamily:
                  "var(--font-inter), Inter, system-ui, sans-serif",
              }}
            >
              Select multiple data sources to generate combined insights
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          flex: "1 0 0",
          position: "relative",
          minHeight: 0,
        }}
      >
        <AnimatePresence mode="wait">
          {count > 0 && (
            <motion.div
              key={singleSelect ? (selectedSignals[0]?.id ?? "single") : "active-content"}
              initial={{ opacity: 0, y: singleSelect ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: singleSelect ? 0 : -10 }}
              transition={{
                duration: singleSelect ? 0.18 : 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: "absolute",
                inset: 0,
                padding: "32px 32px 0 32px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  width: "100%",
                }}
              >
                <motion.div layout style={{ display: "flex", gap: 16 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                >
                  <AnimatePresence mode="popLayout">
                    {selectedSignals.map((signal, i) => (
                      <SignalIconBadge
                        key={signal.id}
                        signal={signal}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "baseline",
                    fontSize: 26,
                    fontWeight: 600,
                    lineHeight: 1.1,
                    width: "100%",
                    fontFamily:
                      "var(--font-inter), Inter, system-ui, sans-serif",
                  }}
                >
                  {selectedSignals.map((signal, i) => (
                    <Fragment key={signal.id}>
                      {i > 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                            delay: 0.08,
                          }}
                          style={{ color: "white" }}
                        >
                          +
                        </motion.span>
                      )}
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.07 }}
                        style={{ color: signal.color }}
                      >
                        {signal.label}
                      </motion.span>
                    </Fragment>
                  ))}
                </div>
              </div>

              {/* Tabs sit above their content — they label what is below them
                  rather than trailing it. They were decorative in the Figma
                  design; Apps had no handler at all, and is where the client's
                  Jobs to be Done live: `Jobs to be Done == Use Case == App`. */}
              <div
                role="tablist"
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: 24,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  flexShrink: 0,
                }}
              >
                {(["overview", "apps"] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        position: "relative",
                        border: "none",
                        background: "transparent",
                        padding: "0 0 10px 0",
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: 1,
                        color: isActive ? "white" : "rgba(255, 255, 255, 0.45)",
                        cursor: "pointer",
                        fontFamily:
                          "var(--font-inter), Inter, system-ui, sans-serif",
                        outline: "none",
                        transition: "color 0.15s ease",
                      }}
                    >
                      {tab === "overview" ? "Overview" : "Tasks & Apps"}
                      {isActive && (
                        <motion.span
                          layoutId="tab-underline"
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 38,
                          }}
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: -1,
                            height: 2,
                            borderRadius: 2,
                            backgroundColor: "white",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {activeTab === "overview" && (
                <motion.p
                  layout
                  transition={{
                    layout: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: "white",
                    width: 378,
                    maxWidth: "100%",
                    margin: 0,
                    fontFamily:
                      "var(--font-inter), Inter, system-ui, sans-serif",
                  }}
                >
                  {description}
                </motion.p>
              )}

              {activeTab === "apps" && (
                <div
                  className="m360-scroll"
                  style={{
                    flex: "1 1 0",
                    minHeight: 0,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    paddingBottom: 32,
                    // Cards must sit in the same 32px gutter on both sides. The
                    // scrollbar is inside the box and shrinks the content area,
                    // so the negative margin has to cover the padding AND the
                    // scrollbar (~11px at `scrollbar-width: thin`) — otherwise
                    // the right edge lands ~11px short of the left.
                    marginRight: -21,
                    paddingRight: 10,
                  }}
                >
                  {useCaseGroups.map((group) => (
                    <div
                      key={group.datalakeId}
                      style={{ display: "flex", flexDirection: "column", gap: 8 }}
                    >
                      {useCaseGroups.length > 1 && (
                        <span
                          style={{
                            fontSize: 11,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: group.color,
                            fontFamily:
                              "var(--font-inter), Inter, system-ui, sans-serif",
                          }}
                        >
                          {group.datalakeLabel}
                        </span>
                      )}

                      {group.useCases.map((uc) => (
                        <UseCaseCard
                          key={uc.id}
                          useCase={uc}
                          title={resolveTitle(uc.title, typeLabel)}
                          onClick={() =>
                            setOpenJob({
                              useCase: uc,
                              accent: group.color,
                              datalakeLabel: group.datalakeLabel,
                            })
                          }
                          onBuildReport={() =>
                            setOpenBuilder({
                              useCase: uc,
                              accent: group.color,
                              datalakeLabel: group.datalakeLabel,
                            })
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The chart belongs to Overview. Apps needs the height for the job list,
          and a chart under a list of jobs would imply the two are related. */}
      {activeTab === "overview" && (
        <div
          style={{
            height: 119,
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-end",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <SignalBarChart selectedSignals={selectedSignals} />
        </div>
      )}

      <AnimatePresence>
        {openJob && (
          <JobPopup
            key={openJob.useCase.id}
            useCase={openJob.useCase}
            title={resolveTitle(openJob.useCase.title, typeLabel)}
            accent={openJob.accent}
            datalakeLabel={openJob.datalakeLabel}
            onClose={() => setOpenJob(null)}
            onBuildReport={() => {
              // Swap modals rather than stack them.
              setOpenBuilder(openJob);
              setOpenJob(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openBuilder && (
          <BuildReportPopup
            key={`build-${openBuilder.useCase.id}`}
            useCase={openBuilder.useCase}
            title={resolveTitle(openBuilder.useCase.title, typeLabel)}
            accent={openBuilder.accent}
            datalakeLabel={openBuilder.datalakeLabel}
            onClose={() => setOpenBuilder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
