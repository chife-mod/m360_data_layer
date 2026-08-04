/**
 * Output history — the journal behind the panel's History section
 * (client, 2026-08-04: piloted on the same dataset that pilots Sources).
 *
 * What lands here is OUTPUTS, not clicks: a report built, a dashboard opened,
 * a template opened. Tile selections are deliberately not journaled — a log
 * of every hover-and-click would drown the three events that matter.
 *
 * Storage is localStorage and that is honest for a prototype: the history is
 * a convenience, not data. Clearing site data clears it — in the real M360
 * this journal belongs server-side behind the user's account (they are
 * logged in there), which is exactly what the demo script should say.
 */

export type HistoryEventType =
  | "report_built"
  | "dashboard_opened"
  | "template_opened";

export type HistoryEvent = {
  id: string;
  /** Epoch ms. */
  ts: number;
  type: HistoryEventType;
  /** Which datalake set was active (banking / watches). */
  setId: string;
  /** The selection the output was produced from. */
  datasetIds: string[];
  useCaseId: string;
  /** App title as resolved at the moment (Type substitution included). */
  title: string;
  /** Where "Open" goes — the produced report / the dashboard. */
  url?: string;
  /** Build Report parameters, ISO dates — what "Rebuild" refills. */
  params?: { bank: string; from: string; to: string; language: string };
};

const KEY = "m360.history.v1";
const CAP = 50;
const EVENT = "m360-history-changed";

export function loadHistory(): HistoryEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEvent[]) : [];
  } catch {
    // Corrupt or blocked storage reads as an empty journal, never as a crash.
    return [];
  }
}

export function appendHistory(
  event: Omit<HistoryEvent, "id" | "ts">
): void {
  if (typeof window === "undefined") return;
  const entry: HistoryEvent = {
    ...event,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
  };
  try {
    const next = [entry, ...loadHistory()].slice(0, CAP);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota/blocked storage: the click still worked, the journal just missed it.
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Subscribe to journal changes (this tab via CustomEvent, others via storage). */
export function onHistoryChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}
