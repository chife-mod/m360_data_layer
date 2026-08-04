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

// ─── Demo seed ────────────────────────────────────────────────────────────────
//
// "Сделаем, как будто там уже есть история" (client, 2026-08-04): a virgin
// journal starts with a believable week of outputs instead of an empty
// section on every dataset. Seeds only when the journal is EMPTY, so the
// moment real outputs exist nothing is ever mixed in, and entries reference
// real use-case ids — Open and Rebuild work on them like on the real thing.

type SeedSpec = {
  type: HistoryEventType;
  datasetIds: string[];
  useCaseId: string;
  /** How long ago the output "happened". */
  agoMs: number;
  params?: HistoryEvent["params"];
};

/** Last full month as ISO bounds — what the seeded reports were "built" for. */
function lastMonthIso(): { from: string; to: string } {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
    to: new Date(now.getFullYear(), now.getMonth(), 0).toISOString(),
  };
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export function seedHistoryIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (loadHistory().length > 0) return;

  // Imported lazily to keep module init cheap and dependency-light.
  // (Static import would also be fine — no cycle — but nothing outside the
  // seed needs use-cases here.)
  import("./use-cases").then(({ findUseCase, PUMB_MONTHLY_PULSE }) => {
    if (loadHistory().length > 0) return; // real output raced the seed — keep it

    const m = lastMonthIso();
    const seeds: SeedSpec[] = [
      {
        type: "report_built",
        datasetIds: ["reviews-banks"],
        useCaseId: "banking-reviews-banks-benchmark",
        agoMs: 26 * 60_000,
        params: { bank: "Oschadbank", from: m.from, to: m.to, language: "en" },
      },
      {
        type: "dashboard_opened",
        datasetIds: ["media"],
        useCaseId: "banking-media-2",
        agoMs: 3 * HOUR,
      },
      {
        type: "dashboard_opened",
        datasetIds: ["kols-finance"],
        useCaseId: "banking-kols-finance-benchmark",
        agoMs: DAY + 2 * HOUR,
      },
      {
        type: "report_built",
        datasetIds: ["media"],
        useCaseId: "banking-media-1",
        agoMs: 2 * DAY + 5 * HOUR,
        params: { bank: "PrivatBank", from: m.from, to: m.to, language: "uk" },
      },
      {
        type: "dashboard_opened",
        datasetIds: ["reviews-apps"],
        useCaseId: "banking-reviews-apps-benchmark",
        agoMs: 4 * DAY + 3 * HOUR,
      },
      {
        type: "dashboard_opened",
        datasetIds: ["reviews-branches"],
        useCaseId: "banking-reviews-branches-benchmark",
        agoMs: 5 * DAY + 7 * HOUR,
      },
      {
        type: "template_opened",
        datasetIds: ["banks"],
        useCaseId: "banking-banks-benchmark",
        agoMs: 6 * DAY + 4 * HOUR,
      },
      {
        type: "dashboard_opened",
        datasetIds: ["kols-celebrities"],
        useCaseId: "banking-kols-celebrities-benchmark",
        agoMs: 8 * DAY + HOUR,
      },
    ];

    const now = Date.now();
    const entries: HistoryEvent[] = [];
    for (const s of seeds) {
      const uc = findUseCase("banking", s.useCaseId);
      if (!uc) continue; // registry moved on — a stale seed just drops out
      const url =
        s.type === "report_built"
          ? PUMB_MONTHLY_PULSE
          : s.type === "dashboard_opened"
            ? uc.dashboardUrl
            : uc.reportTemplateUrl;
      entries.push({
        id: `seed-${s.useCaseId}-${s.type}`,
        ts: now - s.agoMs,
        type: s.type,
        setId: "banking",
        datasetIds: s.datasetIds,
        useCaseId: s.useCaseId,
        title: uc.title,
        url,
        params: s.params,
      });
    }
    if (entries.length === 0) return;

    try {
      window.localStorage.setItem(KEY, JSON.stringify(entries));
      window.dispatchEvent(new CustomEvent(EVENT));
    } catch {
      // Blocked storage: the app just behaves as before the seed existed.
    }
  });
}
