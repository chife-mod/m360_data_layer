"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Period picker for the Build Report popup — Toggl's range picker translated
 * into the module's tokens. Shortcut rail on the left (This week … Last 12
 * months), two month grids with ISO week numbers on the right, and free range
 * selection: first click sets the start, second the end, a click before the
 * start restarts the range. Hand-rolled rather than a picker library: the UI
 * here is all inline-styled on module tokens, and restyling a component
 * library costs more than a calendar.
 */

export type Period = { from: Date; to: Date };

type Props = {
  label: string;
  value: Period;
  onChange: (p: Period) => void;
};

const FONT = "var(--font-inter), Inter, system-ui, sans-serif";
const PANEL_BG = "#111539";
const CONTROL_FILL = "#070a28";
const ACCENT = "#646eca";
const RANGE_BG = "rgba(100,110,202,0.28)";

// ── date helpers (local-time, day precision) ──────────────────────────────────

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) => day(a).getTime() === day(b).getTime();
const inRange = (d: Date, a: Date, b: Date) =>
  day(d).getTime() >= day(a).getTime() && day(d).getTime() <= day(b).getTime();

function startOfWeek(d: Date): Date {
  const x = day(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday-first
  return x;
}

function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7) + 3); // its Thursday
  const jan4 = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return 1 + Math.round((t.getTime() - jan4.getTime()) / 604800000);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

function formatPeriod(p: Period): string {
  const { from, to } = p;
  if (sameDay(from, to))
    return `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]} ${from.getFullYear()}`;
  if (from.getFullYear() === to.getFullYear()) {
    if (from.getMonth() === to.getMonth())
      return `${from.getDate()}–${to.getDate()} ${MONTHS_SHORT[to.getMonth()]} ${to.getFullYear()}`;
    return `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]} – ${to.getDate()} ${MONTHS_SHORT[to.getMonth()]} ${to.getFullYear()}`;
  }
  return `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]} ${from.getFullYear()} – ${to.getDate()} ${MONTHS_SHORT[to.getMonth()]} ${to.getFullYear()}`;
}

// ── shortcuts ────────────────────────────────────────────────────────────────

function shortcuts(today: Date): { id: string; label: string; range: Period }[] {
  const y = today.getFullYear();
  const m = today.getMonth();
  const weekStart = startOfWeek(today);
  const q = Math.floor(m / 3) * 3;

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

  const twelveAgo = new Date(y, m - 11, 1);

  return [
    { id: "this-week", label: "This week", range: { from: weekStart, to: addDays(weekStart, 6) } },
    { id: "this-month", label: "This month", range: { from: new Date(y, m, 1), to: new Date(y, m + 1, 0) } },
    { id: "this-quarter", label: "This quarter", range: { from: new Date(y, q, 1), to: new Date(y, q + 3, 0) } },
    { id: "this-year", label: "This year", range: { from: new Date(y, 0, 1), to: new Date(y, 11, 31) } },
    { id: "last-week", label: "Last week", range: { from: lastWeekStart, to: lastWeekEnd } },
    { id: "last-month", label: "Last month", range: { from: new Date(y, m - 1, 1), to: new Date(y, m, 0) } },
    { id: "last-12", label: "Last 12 months", range: { from: twelveAgo, to: day(today) } },
  ];
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// ── month grid ───────────────────────────────────────────────────────────────

type Cell = { date: Date; current: boolean };

function monthWeeks(year: number, month: number): Cell[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const weeks: Cell[][] = [];
  let cursor = startOfWeek(first);
  while (cursor.getTime() <= last.getTime()) {
    const week: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(cursor, i);
      week.push({ date: d, current: d.getMonth() === month });
    }
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

const CELL = 30;

function MonthGrid({
  year,
  month,
  from,
  to,
  pending,
  onPick,
}: {
  year: number;
  month: number;
  from: Date;
  to: Date | null;
  pending: boolean;
  onPick: (d: Date) => void;
}) {
  const weeks = monthWeeks(year, month);
  const effectiveTo = to ?? from;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Weekday header */}
      <div style={{ display: "flex", gap: 0, paddingLeft: 34 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <span
            key={w}
            style={{
              width: CELL,
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.03em",
              color: "rgba(255,255,255,0.35)",
              paddingBottom: 4,
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              width: 34,
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              textAlign: "left",
              paddingLeft: 2,
            }}
          >
            W{isoWeek(week.find((c) => c.current)?.date ?? week[0].date)}
          </span>

          {week.map((cell, ci) => {
            if (!cell.current) {
              return <span key={ci} style={{ width: CELL, height: CELL }} />;
            }
            const d = cell.date;
            const selected = !pending
              ? inRange(d, from, effectiveTo)
              : sameDay(d, from);
            const isStart = sameDay(d, from);
            const isEnd = !pending && sameDay(d, effectiveTo);

            // Rounded where the visual bar breaks: at the range ends, at the
            // week's edges, and at month edges — matching the reference.
            const prev = ci > 0 ? week[ci - 1] : null;
            const next = ci < 6 ? week[ci + 1] : null;
            const prevIn =
              !pending && !!prev && prev.current && inRange(prev.date, from, effectiveTo);
            const nextIn =
              !pending && !!next && next.current && inRange(next.date, from, effectiveTo);
            const rl = selected && (!prevIn || isStart) ? 8 : 0;
            const rr = selected && (!nextIn || isEnd) ? 8 : 0;

            return (
              <button
                key={ci}
                type="button"
                onClick={() => onPick(d)}
                style={{
                  width: CELL,
                  height: CELL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontFamily: FONT,
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  padding: 0,
                  color:
                    isStart || isEnd
                      ? "#ffffff"
                      : selected
                        ? "rgba(255,255,255,0.92)"
                        : "rgba(255,255,255,0.75)",
                  backgroundColor:
                    isStart || isEnd ? ACCENT : selected ? RANGE_BG : "transparent",
                  borderTopLeftRadius: rl,
                  borderBottomLeftRadius: rl,
                  borderTopRightRadius: rr,
                  borderBottomRightRadius: rr,
                  fontWeight: isStart || isEnd ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!selected)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  if (!selected)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "transparent";
                }}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── the picker ───────────────────────────────────────────────────────────────

export function PeriodPicker({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  // While picking: `from` chosen, `to` not yet.
  const [pendingFrom, setPendingFrom] = useState<Date | null>(null);
  const [view, setView] = useState(() => ({
    y: value.from.getFullYear(),
    m: value.from.getMonth(),
  }));
  const rootRef = useRef<HTMLDivElement>(null);

  const today = day(new Date());
  const cuts = shortcuts(today);
  const activeCut = cuts.find(
    (c) => sameDay(c.range.from, value.from) && sameDay(c.range.to, value.to)
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setPendingFrom(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Swallow it so the popup underneath does not close as well.
        e.stopPropagation();
        setOpen(false);
        setPendingFrom(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    // Capture phase: the Build Report popup listens for Escape on the same
    // document, and the picker must win while it is open.
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const openPanel = () => {
    setView({ y: value.from.getFullYear(), m: value.from.getMonth() });
    setPendingFrom(null);
    setOpen(true);
  };

  const pick = (d: Date) => {
    if (!pendingFrom) {
      setPendingFrom(d);
      return;
    }
    if (d.getTime() < pendingFrom.getTime()) {
      // Clicked before the start — restart the range from here.
      setPendingFrom(d);
      return;
    }
    onChange({ from: pendingFrom, to: d });
    setPendingFrom(null);
  };

  const shift = (n: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const second = new Date(view.y, view.m + 1, 1);
  const shown: Period = pendingFrom
    ? { from: pendingFrom, to: pendingFrom }
    : value;

  return (
    <div
      ref={rootRef}
      style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}
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

      {/* Trigger — same chrome as the Select control */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%",
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "6px 12px 6px 14px",
          borderRadius: 10,
          backgroundColor: CONTROL_FILL,
          border: `1px solid ${
            open
              ? "rgba(100,110,202,1)"
              : hovered
                ? "rgba(159,169,255,0.55)"
                : "rgba(255,255,255,0.12)"
          }`,
          cursor: "pointer",
          outline: "none",
          transition: "border-color 0.15s ease",
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 500,
          color: "rgba(255,255,255,0.95)",
          textAlign: "left",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {formatPeriod(value)}
        </span>
        <span style={{ fontSize: 12, opacity: 0.5 }}>▾</span>
      </button>

      {/* Panel */}
      <motion.div
        role="dialog"
        aria-label="Choose period"
        aria-hidden={!open}
        initial={false}
        animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          zIndex: 80,
          display: "flex",
          gap: 0,
          padding: 16,
          borderRadius: 12,
          backgroundColor: PANEL_BG,
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          pointerEvents: open ? "auto" : "none",
          width: "max-content",
        }}
      >
        {/* Shortcut rail */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            paddingRight: 14,
            marginRight: 14,
            borderRight: "1px solid rgba(255,255,255,0.08)",
            minWidth: 130,
          }}
        >
          {cuts.map((c) => {
            const active = activeCut?.id === c.id && !pendingFrom;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.range);
                  setPendingFrom(null);
                  setView({
                    y: c.range.from.getFullYear(),
                    m: c.range.from.getMonth(),
                  });
                }}
                style={{
                  textAlign: "left",
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: FONT,
                  fontSize: 13,
                  color: active ? "#c7cdff" : "rgba(255,255,255,0.7)",
                  backgroundColor: active ? RANGE_BG : "transparent",
                  fontWeight: active ? 500 : 400,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "transparent";
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Two months */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shift(-1)}
              style={navBtn}
            >
              ‹
            </button>
            <div style={{ display: "flex", gap: 56, flex: 1, justifyContent: "space-around" }}>
              <span style={monthTitle}>
                {MONTHS[view.m]} {view.y}
              </span>
              <span style={monthTitle}>
                {MONTHS[second.getMonth()]} {second.getFullYear()}
              </span>
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shift(1)}
              style={navBtn}
            >
              ›
            </button>
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <MonthGrid
              year={view.y}
              month={view.m}
              from={shown.from}
              to={pendingFrom ? null : shown.to}
              pending={!!pendingFrom}
              onPick={pick}
            />
            <MonthGrid
              year={second.getFullYear()}
              month={second.getMonth()}
              from={shown.from}
              to={pendingFrom ? null : shown.to}
              pending={!!pendingFrom}
              onPick={pick}
            />
          </div>

          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
            {pendingFrom
              ? "Now pick the end of the period"
              : "Click a start day, then an end day — or use a shortcut"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "transparent",
  color: "rgba(255,255,255,0.7)",
  cursor: "pointer",
  outline: "none",
  fontSize: 15,
  lineHeight: 1,
  flexShrink: 0,
};

const monthTitle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 600,
  color: "rgba(255,255,255,0.9)",
};
