"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Datalake,
  DatalakeInsight,
  DatalakeSource,
} from "@/lib/v2/datalakes";
import { getInsightDescription } from "@/lib/v2/signals-data";
import { getAssetPath } from "@/lib/utils";
import {
  getUseCaseGroups,
  resolveTitle,
  findUseCase,
  PUMB_MONTHLY_PULSE,
} from "@/lib/v2/use-cases";
import {
  appendHistory,
  loadHistory,
  onHistoryChange,
  type HistoryEvent,
  type HistoryEventType,
} from "@/lib/v2/history";
import {
  ALL_ROLES,
  ROLE_META,
  getRoleTasks,
  filterByRole,
} from "@/lib/v2/roles";
import type { DatalakeSet } from "@/lib/v2/datalakes";
import { Select } from "./Select";
import { PeriodPicker, type Period } from "./PeriodPicker";
import type { UseCase } from "@/lib/v2/use-cases";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "1–30 Jun" within a month, "28 May – 3 Jun" across months. */
function formatPeriod(fromIso: string, toIso: string): string {
  const f = new Date(fromIso);
  const t = new Date(toIso);
  if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return "";
  const fm = MONTHS_SHORT[f.getMonth()];
  const tm = MONTHS_SHORT[t.getMonth()];
  return f.getMonth() === t.getMonth() && f.getFullYear() === t.getFullYear()
    ? `${f.getDate()}–${t.getDate()} ${fm}`
    : `${f.getDate()} ${fm} – ${t.getDate()} ${tm}`;
}

function timeAgo(ts: number): string {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const FONT = "var(--font-inter), Inter, system-ui, sans-serif";

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

/**
 * Heading each panel section starts with — the tab bar's replacement. Tabs
 * died on 2026-08-03 ("минимальное время до шашлыка"): the panel is one
 * scroll now, and these are its landmarks. Landmarks must read as landmarks
 * (client, 2026-08-04): 18px, plain white — not a whispered uppercase label.
 */
function SectionHeading({
  label,
  aside,
}: {
  label: string;
  aside?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.2,
          color: "#ffffff",
          fontFamily: FONT,
        }}
      >
        {label}
      </span>
      {aside}
    </div>
  );
}

/** Shared chrome for the panel's scroll sections: hairline on top, then rows. */
const sectionStyle: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.08)",
  paddingTop: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

/** 15px inline glyph, Tabler geometry, stroked with currentColor. */
function ChipIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, opacity: 0.7 }}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const ICON_DATABASE = (
  <>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v6a8 3 0 0 0 16 0V6" />
    <path d="M4 12v6a8 3 0 0 0 16 0v-6" />
  </>
);

const ICON_SKIP_BACK = (
  <>
    <path d="M4 5v14" />
    <path d="M20 5v14l-12 -7z" />
  </>
);

const ICON_COMPASS = (
  <>
    <path d="M8 16l2 -6l6 -2l-2 6z" />
    <circle cx="12" cy="12" r="9" />
  </>
);

/**
 * One lake-level fact — a chip with a hover tooltip carrying the definition.
 * The chips answer "how deep and how complete is this lake" at a glance
 * (client email, 2026-08-04: archive depth, zero-day indexing, explorer);
 * the tooltip is where a term like Zero-Day gets its one-sentence explainer.
 */
function FactChip({
  icon,
  label,
  tooltip,
  tooltipAlign = "left",
  href,
  onNavigate,
}: {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  /** "right" for chips that sit near the panel's right edge — an overflowing
      tooltip would otherwise engage the scroll column's horizontal overflow. */
  tooltipAlign?: "left" | "right";
  href?: string;
  onNavigate?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    height: 28,
    padding: "0 11px",
    borderRadius: 8,
    border: `1px solid ${
      hovered ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.14)"
    }`,
    backgroundColor: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
    fontSize: 13,
    lineHeight: 1,
    color: "rgba(255,255,255,0.78)",
    whiteSpace: "nowrap",
    textDecoration: "none",
    transition: "border-color 0.15s ease, background-color 0.15s ease",
    cursor: href ? "pointer" : "default",
    fontFamily: FONT,
  };
  const content = (
    <>
      <ChipIcon>{icon}</ChipIcon>
      {label}
      {href && <span style={{ opacity: 0.45, fontSize: 11 }}>↗</span>}
    </>
  );
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.();
          }}
          style={chipStyle}
        >
          {content}
        </a>
      ) : (
        <span style={chipStyle}>{content}</span>
      )}
      <span
        role="tooltip"
        style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          ...(tooltipAlign === "left" ? { left: 0 } : { right: 0 }),
          width: 240,
          padding: "8px 11px",
          borderRadius: 8,
          backgroundColor: "#1b2050",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          fontSize: 13,
          lineHeight: 1.45,
          color: "rgba(255,255,255,0.82)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease",
          pointerEvents: "none",
          zIndex: 30,
          fontFamily: FONT,
          whiteSpace: "normal",
        }}
      >
        {tooltip}
      </span>
    </span>
  );
}

/**
 * The lake's passport line — archive depth, zero-day indexing, explorer.
 * Sits right under the overview copy, before any section: these are facts
 * about the lake itself, not content from it. Only facts the lake actually
 * has render; a lake with none renders no strip at all.
 */
function FactsStrip({
  lake,
  onExplorerOpen,
}: {
  lake: Datalake;
  onExplorerOpen: (url: string) => void;
}) {
  const years = lake.archiveYears;
  const hasOtherFacts = years !== undefined || lake.zeroDayIndexed;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: -6 }}>
      {years !== undefined && (
        <FactChip
          icon={ICON_DATABASE}
          label={`Archive · ${years} ${years === 1 ? "year" : "years"}`}
          tooltip={`The archive in this lake reaches ${years} years back.`}
        />
      )}
      {lake.zeroDayIndexed && (
        <FactChip
          icon={ICON_SKIP_BACK}
          label="Zero-Day indexed"
          tooltip="Every source in this lake is collected from its very first message — a source that is 5 years old contributes 5 years of archive."
        />
      )}
      {lake.explorerUrl && (
        <FactChip
          icon={ICON_COMPASS}
          label="Explorer"
          tooltip="A browsable explorer over this lake — its entities, boards and metrics. Opens in a new tab."
          tooltipAlign={hasOtherFacts ? "right" : "left"}
          href={lake.explorerUrl}
          onNavigate={() => onExplorerOpen(lake.explorerUrl!)}
        />
      )}
    </div>
  );
}

/**
 * One source — a link, because the client wants sources one click away
 * ("ты можешь их в один клик открыть"). Name, domain, monthly intake.
 */
function SourceRow({
  source,
  accent,
}: {
  source: DatalakeSource;
  accent: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`https://${source.domain}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        // Negative margin so the hover pill breathes while the text column
        // stays on the panel's 32px gutter.
        padding: "5px 10px",
        margin: "0 -10px",
        borderRadius: 8,
        textDecoration: "none",
        backgroundColor: hovered ? "rgba(255,255,255,0.05)" : "transparent",
        transition: "background-color 0.15s ease",
        fontFamily: FONT,
      }}
    >
      {/* Real favicon on a white tile — the same presentation bank logos get
          in the builder (client, 2026-08-04: "у источников всегда реальные
          логотипы"). The initial is only the no-asset fallback. */}
      {source.image ? (
        <span
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            flexShrink: 0,
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={getAssetPath(source.image)}
            alt=""
            width={18}
            height={18}
            draggable={false}
            style={{ display: "block", objectFit: "contain" }}
          />
        </span>
      ) : (
        <span
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            flexShrink: 0,
            backgroundColor: hexToRgba(accent, 0.14),
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {source.name[0]}
        </span>
      )}
      <span
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.92)",
          whiteSpace: "nowrap",
        }}
      >
        {source.name}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.45)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {source.domain}
      </span>
      <span style={{ flex: "1 1 auto" }} />
      {/* Last element on purpose — the volume sits flush on the section's
          right edge, the same line "top 5 of 8" ends on. The hover arrow that
          used to follow it reserved width and read as the value shifting
          (client, 2026-08-04); the row hover pill already says "clickable". */}
      <span
        style={{
          fontSize: 13,
          color: hovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
          transition: "color 0.15s ease",
        }}
      >
        {source.monthlyVolume}
      </span>
    </a>
  );
}

function SourcesSection({
  sources,
  total,
  accent,
}: {
  sources: DatalakeSource[];
  total?: number;
  accent: string;
}) {
  return (
    <section style={{ ...sectionStyle, gap: 6 }}>
      <SectionHeading
        label="Sources"
        aside={
          total !== undefined && total > sources.length ? (
            <span
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.4)",
                fontFamily: FONT,
              }}
            >
              top {sources.length} of {total}
            </span>
          ) : undefined
        }
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sources.map((s) => (
          <SourceRow key={s.domain} source={s} accent={accent} />
        ))}
      </div>
    </section>
  );
}

const TONE_COLORS: Record<DatalakeInsight["tone"], string> = {
  negative: "#F43F5E",
  positive: "#46FEC3",
  neutral: "#9FA9FF",
};

/**
 * One weekly finding — the client's sketch from 2026-08-03: "два-три инсайта…
 * я домотал до низа, я вижу, по этому озеру, про этот рынок". Headline with a
 * tone dot, optional delta chip, optional mini ranking.
 */
function InsightCard({ insight }: { insight: DatalakeInsight }) {
  const tone = TONE_COLORS[insight.tone];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "12px 14px",
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: FONT,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: tone,
            boxShadow: `0 0 8px ${hexToRgba(tone, 0.5)}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.35,
            color: "rgba(255,255,255,0.95)",
            flex: "1 1 auto",
          }}
        >
          {insight.title}
        </span>
        {insight.delta && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: tone,
              backgroundColor: hexToRgba(tone, 0.12),
              borderRadius: 4,
              padding: "2px 6px",
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {insight.delta}
          </span>
        )}
      </div>

      {insight.detail && (
        // 14px, not 12.5: the panel's readable-text floor is 13 (2026-08-04 —
        // "двенадцатый это уже слишком маленький"), and low-alpha small text
        // was failing AA anyway.
        <span
          style={{
            fontSize: 14,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {insight.detail}
        </span>
      )}

      {insight.ranking && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 2,
          }}
        >
          {insight.ranking.map((r) => (
            <div
              key={r.label}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.75)",
                  width: 100,
                  flexShrink: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.label}
              </span>
              <span
                style={{
                  flex: "1 1 auto",
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: `${r.value}%`,
                    height: "100%",
                    borderRadius: 2,
                    backgroundColor: hexToRgba(tone, 0.75),
                  }}
                />
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  width: 34,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {r.value}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightsSection({ insights }: { insights: DatalakeInsight[] }) {
  return (
    <section style={sectionStyle}>
      <SectionHeading
        label="Insights · Weekly"
        aside={
          // The figures are authored samples, not measurements — the chip keeps
          // that honest on screen the way "draft" does for apps.
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 4,
              padding: "1px 5px",
              fontFamily: FONT,
            }}
          >
            sample
          </span>
        }
      />
      {insights.map((i) => (
        <InsightCard key={i.id} insight={i} />
      ))}
    </section>
  );
}

const HISTORY_TYPE_ICON: Record<HistoryEventType, string> = {
  report_built: "ui-build",
  dashboard_opened: "ui-dashboard",
  template_opened: "ui-report-template",
  explorer_opened: "ui-dashboard",
};

const HISTORY_TYPE_LABEL: Record<HistoryEventType, string> = {
  report_built: "Report",
  dashboard_opened: "Dashboard",
  template_opened: "Template",
  explorer_opened: "Explorer",
};

/**
 * One journal entry. The row opens the output again; Rebuild (report entries
 * only) reopens Build Report with the entry's parameters — repeat last
 * month's report in one click.
 */
function HistoryRow({
  event,
  onRebuild,
}: {
  event: HistoryEvent;
  onRebuild?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const sub =
    event.type === "report_built" && event.params
      ? `${event.params.bank} · ${formatPeriod(
          event.params.from,
          event.params.to
        )} · ${event.params.language.toUpperCase()}`
      : HISTORY_TYPE_LABEL[event.type];

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!event.url) e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "5px 10px",
        margin: "0 -10px",
        borderRadius: 8,
        textDecoration: "none",
        backgroundColor: hovered ? "rgba(255,255,255,0.05)" : "transparent",
        transition: "background-color 0.15s ease",
        fontFamily: FONT,
      }}
    >
      <img
        src={getAssetPath(`/assets/icons/${HISTORY_TYPE_ICON[event.type]}.svg`)}
        alt=""
        width={15}
        height={15}
        draggable={false}
        style={{ filter: "invert(1)", opacity: 0.5, flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.92)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flexShrink: 1,
        }}
      >
        {event.title}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flexShrink: 2,
        }}
      >
        {sub}
      </span>
      <span style={{ flex: "1 1 auto" }} />
      <span
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.45)",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {timeAgo(event.ts)}
      </span>
      {onRebuild && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRebuild();
          }}
          style={{
            height: 22,
            padding: "0 8px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "transparent",
            color: "rgba(255,255,255,0.85)",
            fontSize: 12,
            lineHeight: 1,
            cursor: "pointer",
            outline: "none",
            fontFamily: FONT,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 0.15s ease",
            flexShrink: 0,
          }}
        >
          Rebuild
        </button>
      )}
    </a>
  );
}

function HistorySection({
  events,
  onRebuild,
}: {
  events: HistoryEvent[];
  onRebuild: (event: HistoryEvent) => void;
}) {
  const shown = events.slice(0, 5);
  const earlier = events.length - shown.length;
  return (
    <section style={{ ...sectionStyle, gap: 6 }}>
      <SectionHeading
        label="History"
        aside={
          // Honest about where the journal lives: localStorage. In the real
          // M360 it belongs server-side behind the account.
          <span
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.4)",
              fontFamily: FONT,
            }}
          >
            this device
          </span>
        }
      />
      {events.length === 0 ? (
        <span
          style={{
            fontSize: 13.5,
            color: "rgba(255,255,255,0.45)",
            fontFamily: FONT,
          }}
        >
          No outputs yet — build a report and it lands here.
        </span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {shown.map((e) => (
            <HistoryRow
              key={e.id}
              event={e}
              onRebuild={
                e.type === "report_built" ? () => onRebuild(e) : undefined
              }
            />
          ))}
          {earlier > 0 && (
            <span
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.4)",
                fontFamily: FONT,
                paddingTop: 4,
              }}
            >
              + {earlier} earlier
            </span>
          )}
        </div>
      )}
    </section>
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
  onNavigate,
}: {
  href: string;
  label: string;
  icon: string;
  /** Fires when the link is actually followed — the history journal's hook. */
  onNavigate?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Without this the click would bubble to the card and open the popup as
      // well — the point is that the link is a separate destination.
      onClick={(e) => {
        e.stopPropagation();
        onNavigate?.();
      }}
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
  onOutput,
}: {
  useCase: UseCase;
  title: string;
  onClick: () => void;
  onBuildReport: () => void;
  /** Journals an output the card produced (dashboard / template opened). */
  onOutput?: (type: HistoryEventType, url: string) => void;
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
        <span style={{ fontSize: 14, lineHeight: 1.45, color: "rgba(255,255,255,0.5)" }}>
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
            onNavigate={() =>
              onOutput?.("template_opened", useCase.reportTemplateUrl!)
            }
          />
        )}
        {useCase.dashboardUrl && (
          <InlineLink
            href={useCase.dashboardUrl}
            label="Dashboard"
            icon="ui-dashboard"
            onNavigate={() =>
              onOutput?.("dashboard_opened", useCase.dashboardUrl!)
            }
          />
        )}
      </div>
    </div>
  );
}

/** Opens the client's report template / dashboard in a new tab. */
function LinkButton({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onNavigate?.()}
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
  onOutput,
}: {
  useCase: UseCase;
  title: string;
  accent: string;
  datalakeLabel: string;
  onClose: () => void;
  onBuildReport: () => void;
  onOutput?: (type: HistoryEventType, url: string) => void;
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
              <LinkButton
                href={useCase.reportTemplateUrl}
                label="Report Templates"
                onNavigate={() =>
                  onOutput?.("template_opened", useCase.reportTemplateUrl!)
                }
              />
            )}
            {useCase.dashboardUrl && (
              <LinkButton
                href={useCase.dashboardUrl}
                label="Dashboard"
                onNavigate={() =>
                  onOutput?.("dashboard_opened", useCase.dashboardUrl!)
                }
              />
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
  // Oschadbank first = the default. The client vetoed PUMB as the default
  // ("странный банк для демо") and named Oschad or Privat, 2026-07-30.
  { id: "Oschadbank", label: "Oschadbank", image: "/assets/banks/oschadbank.png" },
  { id: "PrivatBank", label: "PrivatBank", image: "/assets/banks/privatbank.png" },
  { id: "PUMB", label: "PUMB", image: "/assets/banks/pumb.png" },
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

/** What Rebuild refills the dialog with — a journal entry's parameters. */
export type BuildInitial = {
  bank?: string;
  period?: Period;
  language?: string;
};

function BuildReportPopup({
  useCase,
  title,
  accent,
  datalakeLabel,
  initial,
  onBuilt,
  onClose,
}: {
  useCase: UseCase;
  title: string;
  accent: string;
  datalakeLabel: string;
  initial?: BuildInitial;
  /** Fires on Build — the history journal's hook. */
  onBuilt?: (params: {
    bank: string;
    period: Period;
    language: string;
    url: string;
  }) => void;
  onClose: () => void;
}) {
  const font = "var(--font-inter), Inter, system-ui, sans-serif";
  const [mounted, setMounted] = useState(false);
  const [bank, setBank] = useState(
    initial?.bank && BUILDER_BANKS.some((b) => b.id === initial.bank)
      ? initial.bank
      : BUILDER_BANKS[0].id
  );
  const [period, setPeriod] = useState<Period>(initial?.period ?? lastMonth);
  const [language, setLanguage] = useState(
    initial?.language &&
      BUILDER_LANGUAGES.some((l) => l.id === initial.language)
      ? initial.language
      : BUILDER_LANGUAGES[0].id
  );
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
    onBuilt?.({ bank, period, language, url: PUMB_MONTHLY_PULSE });
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
  selectedSignals: Datalake[];
  /**
   * Copy for the current combination. Supplied by the page because it depends
   * on the active datalake set (watches / banking), which this panel does not
   * know about. Falls back to the watches lookup when omitted.
   */
  description?: string;
  /**
   * The selected dataset is filtered out by the LLM toggle — render the
   * "why this is not in LLMs" view instead of the dataset's content
   * (client, 2026-08-04).
   */
  llmBlocked?: boolean;
  /** Which datalake set is active — needed to look up apps. */
  setId?: string;
  /** Current Type selector label — some app titles depend on it. */
  typeLabel?: string;
  /**
   * Role & Tasks view (2026-08-04): the picked role, "all" for none. With a
   * role and NO selection the panel flips its axis — tasks first, grouped by
   * lake; with a selection the role filters that dataset's apps.
   */
  roleId?: string;
  /** The active set — the role view walks every lake's apps, not a selection. */
  set?: DatalakeSet;
};

/**
 * Placeholder for the per-dataset "why not in LLMs" explanation — lorem BY
 * CLIENT REQUEST (2026-08-04: "вставь Lorem Ipsum, не придумывай текст"): he
 * writes the real argument (hallucinations, coverage, freshness), we do not
 * invent it. A deliberate exception to the no-lorem rule of 2026-07-30 —
 * that rule was about unwritten dataset copy pretending to be finished.
 */
const LLM_BLOCKED_PLACEHOLDER =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod " +
  "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim " +
  "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea " +
  "commodo consequat.";

export function InsightPanel({
  selectedSignals,
  description: descriptionProp,
  llmBlocked = false,
  setId = "watches",
  typeLabel = "",
  roleId = ALL_ROLES,
  set,
}: Props) {
  const count = selectedSignals.length;
  const description =
    descriptionProp ?? getInsightDescription(selectedSignals.map((s) => s.id));

  const [openJob, setOpenJob] = useState<{
    useCase: UseCase;
    accent: string;
    datalakeLabel: string;
    /** Journal context when opened outside a selection (role view). */
    journalDatasetIds?: string[];
  } | null>(null);
  const [openBuilder, setOpenBuilder] = useState<{
    useCase: UseCase;
    accent: string;
    datalakeLabel: string;
    /** Present when opened from a journal entry's Rebuild. */
    initial?: BuildInitial;
    /** Journal context when opened outside a selection (role view). */
    journalDatasetIds?: string[];
  } | null>(null);

  // A popup for a job that is no longer on screen would be orphaned — the
  // selection changing or the role flipping both rebuild the list behind it.
  useEffect(() => {
    setOpenJob(null);
    setOpenBuilder(null);
  }, [count, roleId]);

  // With a role picked, the role is a lens over everything — a selected
  // dataset shows only that role's apps, and the count says so.
  const useCaseGroups = getUseCaseGroups(setId, selectedSignals).map((g) => ({
    ...g,
    useCases: filterByRole(g.useCases, roleId),
  }));
  const totalApps = useCaseGroups.reduce((n, g) => n + g.useCases.length, 0);

  // Role view data — every task the role can run, across all lakes, grouped.
  const roleView = roleId !== ALL_ROLES && count === 0 && set ? true : false;
  const roleTasks = roleView ? getRoleTasks(set!, roleId) : [];
  const roleGroups = new Map<
    string,
    { label: string; color: string; tasks: typeof roleTasks }
  >();
  for (const t of roleTasks) {
    const g = roleGroups.get(t.datalakeId) ?? {
      label: t.datalakeLabel,
      color: t.color,
      tasks: [] as typeof roleTasks,
    };
    g.tasks.push(t);
    roleGroups.set(t.datalakeId, g);
  }

  // Sources and weekly insights read as properties of ONE dataset — with a
  // combination selected, whose sources would they be? Single selection only.
  const single = count === 1 ? selectedSignals[0] : null;

  // ── Output history ──────────────────────────────────────────────────────
  // The journal lives in localStorage (see lib/v2/history.ts); the panel just
  // mirrors it and appends on real outputs.
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  useEffect(() => {
    setHistory(loadHistory());
    return onHistoryChange(() => setHistory(loadHistory()));
  }, []);

  const recordOutput = (
    type: HistoryEventType,
    useCase: UseCase,
    title: string,
    url?: string,
    params?: HistoryEvent["params"],
    datasetIds?: string[]
  ) => {
    appendHistory({
      type,
      setId,
      // Role view runs tasks with no selection — the task's own lake is the
      // journal context then.
      datasetIds: datasetIds ?? selectedSignals.map((s) => s.id),
      useCaseId: useCase.id,
      title,
      url,
      params,
    });
  };

  // Entries shown under the current dataset: produced from a selection this
  // dataset was part of, in this set.
  const datasetHistory = single
    ? history.filter(
        (e) => e.setId === setId && e.datasetIds.includes(single.id)
      )
    : [];

  const handleRebuild = (e: HistoryEvent) => {
    const useCase = e.useCaseId ? findUseCase(setId, e.useCaseId) : undefined;
    if (!useCase || !single) return;
    const from = e.params ? new Date(e.params.from) : null;
    const to = e.params ? new Date(e.params.to) : null;
    const periodValid =
      from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime());
    setOpenBuilder({
      useCase,
      accent: single.color,
      datalakeLabel: single.label,
      initial: e.params
        ? {
            bank: e.params.bank,
            period: periodValid ? { from: from!, to: to! } : undefined,
            language: e.params.language,
          }
        : undefined,
    });
  };

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
        {count === 0 && !roleView && (
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
              Select a dataset to explore it — add more on hover, up to three
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
        {/* Concurrent crossfade on purpose — NOT mode="wait". Wait-mode holds
            the next dataset back until the old one's exit finishes, and a
            click that lands inside that 200ms window (the demo IS rapid
            clicking now that a body click swaps the selection) leaves the
            panel stuck on the exiting node. Both nodes are absolutely
            positioned, so they overlap for the fade and nothing jumps. */}
        <AnimatePresence>
          {roleView && (
            <motion.div
              key={`role-${roleId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="m360-scroll"
              style={{
                position: "absolute",
                inset: 0,
                overflowY: "auto",
                padding: "28px 26px 28px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {/* The flipped axis (client, 2026-08-03): not "dataset → what
                  can it do" but "my role → what can I run". */}
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: FONT,
                  marginBottom: -10,
                }}
              >
                Role view
              </span>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  lineHeight: 1.15,
                  color: "#ffffff",
                  fontFamily: FONT,
                }}
              >
                Tasks for{" "}
                {/* The role wears its selector accent — same link the lake
                    titles keep to their tiles. 26px display text, so the
                    accent-on-body-text rule stays intact. */}
                <span
                  style={{ color: ROLE_META[roleId]?.accent ?? "#9FA9FF" }}
                >
                  {roleId}
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.55)",
                  margin: 0,
                  fontFamily: FONT,
                }}
              >
                {roleTasks.length} task{roleTasks.length === 1 ? "" : "s"}{" "}
                across {roleGroups.size} dataset
                {roleGroups.size === 1 ? "" : "s"} — the lit tiles are where{" "}
                {roleId} works. Pick one to narrow down.
              </p>

              {[...roleGroups.entries()].map(([lakeId, g]) => (
                <section key={lakeId} style={{ ...sectionStyle, gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: g.color,
                      fontFamily: FONT,
                    }}
                  >
                    {g.label}
                  </span>
                  {g.tasks.map((t) => (
                    <UseCaseCard
                      key={t.useCase.id}
                      useCase={t.useCase}
                      title={resolveTitle(t.useCase.title, typeLabel)}
                      onClick={() =>
                        setOpenJob({
                          useCase: t.useCase,
                          accent: t.color,
                          datalakeLabel: t.datalakeLabel,
                          journalDatasetIds: [t.datalakeId],
                        })
                      }
                      onBuildReport={() =>
                        setOpenBuilder({
                          useCase: t.useCase,
                          accent: t.color,
                          datalakeLabel: t.datalakeLabel,
                          journalDatasetIds: [t.datalakeId],
                        })
                      }
                      onOutput={(type, url) =>
                        recordOutput(
                          type,
                          t.useCase,
                          resolveTitle(t.useCase.title, typeLabel),
                          url,
                          undefined,
                          [t.datalakeId]
                        )
                      }
                    />
                  ))}
                </section>
              ))}
            </motion.div>
          )}

          {count > 0 && (
            <motion.div
              // Single selection keys by dataset so hopping tiles cross-fades
              // the whole column; a combination keeps one key so adding a lake
              // animates in place instead of remounting everything. The
              // blocked flag joins the key so toggling LLM mode cross-fades
              // between content and the "why not" view.
              key={
                count === 1
                  ? `${selectedSignals[0].id}${llmBlocked ? "-llm-blocked" : ""}`
                  : "multi"
              }
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="m360-scroll"
              // One scroll, no tabs (client call, 2026-08-03): title first,
              // overview right under it, then Sources / Tasks & Apps /
              // Insights as sections — "всё поднялось, сразу видим текст".
              style={{
                position: "absolute",
                inset: 0,
                overflowY: "auto",
                padding: "28px 26px 28px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {/* Blocked slug — states the situation; the reason below is the
                  client's to write. */}
              {llmBlocked && (
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: FONT,
                    marginBottom: -10,
                  }}
                >
                  Not available in LLMs
                </span>
              )}

              {/* Title — the first thing in the panel now. The icon-badge row
                  and the tab bar above it died on 2026-08-03: "иконка убили,
                  заголовок поднялся, место под табы убили". A blocked dataset
                  keeps its name but loses its colour — light grey, not accent
                  (client, 2026-08-04). */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "baseline",
                  fontSize: 26,
                  fontWeight: 600,
                  lineHeight: 1.15,
                  width: "100%",
                  flexShrink: 0,
                  fontFamily: FONT,
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
                      style={{
                        color: llmBlocked
                          ? "rgba(255,255,255,0.55)"
                          : signal.color,
                      }}
                    >
                      {signal.label}
                    </motion.span>
                  </Fragment>
                ))}
              </div>

              {/* A blocked dataset shows the reason it is out of LLM reach and
                  nothing else — no sources, no apps, no insights: the point
                  of the state is the limitation, not the content. */}
              {llmBlocked && (
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.55)",
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  {LLM_BLOCKED_PLACEHOLDER}
                </p>
              )}

              {/* No paragraph at all when there is no copy — an empty <p> would
                  still take its line-height and leave a phantom gap. */}
              {!llmBlocked && description && (
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.9)",
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  {description}
                </p>
              )}

              {/* The lake's passport — archive depth, zero-day indexing,
                  explorer (client email, 2026-08-04). Facts about the lake,
                  so they sit with the overview, above the content sections. */}
              {!llmBlocked &&
                single &&
                (single.archiveYears !== undefined ||
                  single.zeroDayIndexed ||
                  single.explorerUrl) && (
                  <FactsStrip
                    lake={single}
                    onExplorerOpen={(url) =>
                      appendHistory({
                        type: "explorer_opened",
                        setId,
                        datasetIds: [single.id],
                        title: `${single.label} Explorer`,
                        url,
                      })
                    }
                  />
                )}

              {/* Sources — datasets that carry the preview only; the pilot is
                  Reviews: Banks (client call, 2026-08-03). */}
              {!llmBlocked && single?.sources && (
                <SourcesSection
                  sources={single.sources}
                  total={single.sourcesTotal}
                  accent={single.color}
                />
              )}

              {/* Tasks & Apps — the tab became a section; the count stays. */}
              {!llmBlocked && (
              <section style={{ ...sectionStyle, gap: 12 }}>
                <SectionHeading label={`Tasks & Apps [${totalApps}]`} />
                {totalApps === 0 && (
                  <span
                    style={{
                      fontSize: 13.5,
                      color: "rgba(255,255,255,0.45)",
                      fontFamily: FONT,
                    }}
                  >
                    {roleId !== ALL_ROLES
                      ? `No ${roleId} tasks for this dataset yet.`
                      : "No apps for this dataset yet."}
                  </span>
                )}
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
                          fontFamily: FONT,
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
                        onOutput={(type, url) =>
                          recordOutput(
                            type,
                            uc,
                            resolveTitle(uc.title, typeLabel),
                            url
                          )
                        }
                      />
                    ))}
                  </div>
                ))}
              </section>
              )}

              {/* Weekly insights — "я домотал до низа, я вижу бац-инсайт"
                  (client call, 2026-08-03). Pilot: Reviews: Banks. */}
              {!llmBlocked && single?.insights && (
                <InsightsSection insights={single.insights} />
              )}

              {/* Output history closes the column. Piloted on the Sources
                  dataset first, rolled out to every dataset the same day
                  ("историю давай тогда везде добавим", 2026-08-04). */}
              {!llmBlocked && single && (
                <HistorySection
                  events={datasetHistory}
                  onRebuild={handleRebuild}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The decorative bar chart that used to close the panel is gone —
          client call, 2026-08-03: "он весёлый, но он не функция". The space
          belongs to real content (apps, sources, insights) now. */}

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
            onOutput={(type, url) =>
              recordOutput(
                type,
                openJob.useCase,
                resolveTitle(openJob.useCase.title, typeLabel),
                url,
                undefined,
                openJob.journalDatasetIds
              )
            }
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
            initial={openBuilder.initial}
            onBuilt={({ bank, period, language, url }) =>
              recordOutput(
                "report_built",
                openBuilder.useCase,
                resolveTitle(openBuilder.useCase.title, typeLabel),
                url,
                {
                  bank,
                  from: period.from.toISOString(),
                  to: period.to.toISOString(),
                  language,
                },
                openBuilder.journalDatasetIds
              )
            }
            onClose={() => setOpenBuilder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
