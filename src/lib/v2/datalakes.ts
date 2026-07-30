/**
 * Data layer registry — V2.
 *
 * The module used to know about exactly one set of 16 signals (watches).
 * The client brief of 2026-07-28 makes the set a function of the selected
 * industry, so the 16 tiles, their relations and their copy all move behind a
 * `DatalakeSet` and the page renders whichever set the current industry points at.
 *
 * Industry -> set mapping (client email, points 2-4):
 *   Watches -> `watches` (the original 16, unchanged)
 *   Banking -> `banking` (16 new ones)
 *   Retail  -> `watches` ("Keep watches" — deliberate, not a stub)
 */

import {
  signalConfigs,
  watchesPairDescriptions,
  watchesTripleDescriptions,
} from "./signals-data";
import { sourcesGrid } from "./sources-data";
import {
  bankingDatalakes,
  bankingPairs,
  bankingTriples,
  bankingAiChatIds,
  bankingFallback,
} from "./datalakes-banking";

export type Datalake = {
  id: string;
  label: string;
  icon: string;
  color: string;
  /** Datalakes that combine well with this one. Symmetrised at read time. */
  recommendedWith: string[];
  descriptionSingle: string;
};

export type DatalakeSet = {
  id: string;
  /** Exactly 16, row-major for the 4x4 grid. */
  datalakes: Datalake[];
  pairDescriptions: Record<string, string>;
  tripleDescriptions: Record<string, string>;
  /** Subset surfaced when the "available in AI chats" toggle is on. */
  aiChatIds: string[];
  /**
   * Shown for combinations nobody wrote copy for. When absent, a sentence is
   * composed from the labels. Sets whose copy is still placeholder set this so
   * an unwritten combination does not render as finished text.
   */
  fallbackDescription?: string;
};

// ─── Watches set — adapted from the original data, unchanged in content ───────

const watchesDatalakes: Datalake[] = sourcesGrid.flat().map((source) => {
  const config = signalConfigs[source.id];
  return {
    id: source.id,
    label: source.label,
    icon: source.icon,
    color: source.color,
    recommendedWith: config?.recommendedWith ?? [],
    descriptionSingle: config?.descriptionSingle ?? "",
  };
});

const watchesSet: DatalakeSet = {
  id: "watches",
  datalakes: watchesDatalakes,
  pairDescriptions: watchesPairDescriptions,
  tripleDescriptions: watchesTripleDescriptions,
  aiChatIds: ["media", "reviews", "products", "brands", "retailers"],
};

const bankingSet: DatalakeSet = {
  id: "banking",
  datalakes: bankingDatalakes,
  pairDescriptions: bankingPairs,
  tripleDescriptions: bankingTriples,
  aiChatIds: bankingAiChatIds,
  fallbackDescription: bankingFallback,
};

export const DATALAKE_SETS: Record<string, DatalakeSet> = {
  watches: watchesSet,
  banking: bankingSet,
};

// ─── Industries and viewer types ──────────────────────────────────────────────

export type ViewerType = {
  id: string;
  label: string;
  /** Icon name under public/assets/icons — shown in the Type selector. */
  icon?: string;
  /** Tile colour in the selector — reuses the module's lake accents. */
  accent?: string;
  /** One-line subtitle under the name in the selector. */
  hint?: string;
};

export type Industry = {
  id: string;
  label: string;
  /** Which set of 16 datalakes this industry shows. */
  setId: string;
  /** Icon name under public/assets/icons — shown in the Industry selector. */
  icon?: string;
  /** Tile colour in the selector — reuses the module's lake accents. */
  accent?: string;
  /** "Who is looking" — drives the second selector. */
  types: ViewerType[];
};

export const INDUSTRIES: Industry[] = [
  {
    id: "watches",
    label: "Watches",
    setId: "watches",
    icon: "ui-ind-watches",
    accent: "#FBBF24",
    types: [
      { id: "brand", label: "Brand", icon: "ui-type-brand", accent: "#46FEC3", hint: "Manufacturer perspective" },
      { id: "retailer", label: "Retailer", icon: "ui-type-retailer", accent: "#F472B6", hint: "Seller perspective" },
      { id: "influencer", label: "Influencer", icon: "ui-type-influencer", accent: "#9333EA", hint: "Creator perspective" },
    ],
  },
  {
    id: "banking",
    label: "Banking",
    setId: "banking",
    icon: "ui-ind-banking",
    accent: "#46FEC3",
    types: [
      { id: "bank", label: "Bank", icon: "ui-type-bank", accent: "#46FEC3", hint: "Institution perspective" },
      { id: "payment-system", label: "Payment System", icon: "ui-type-payment", accent: "#84CC16", hint: "Scheme perspective" },
      { id: "influencer", label: "Influencer", icon: "ui-type-influencer", accent: "#9333EA", hint: "Creator perspective" },
    ],
  },
  {
    id: "retail",
    label: "Retail",
    setId: "watches",
    icon: "ui-ind-retail",
    accent: "#F472B6",
    types: [
      { id: "retailer", label: "Retailer", icon: "ui-type-retailer", accent: "#F472B6", hint: "Seller perspective" },
      { id: "brand", label: "Brand", icon: "ui-type-brand", accent: "#46FEC3", hint: "Manufacturer perspective" },
      { id: "influencer", label: "Influencer", icon: "ui-type-influencer", accent: "#9333EA", hint: "Creator perspective" },
    ],
  },
];

export function getIndustry(industryId: string): Industry {
  return INDUSTRIES.find((i) => i.id === industryId) ?? INDUSTRIES[0];
}

export function getDatalakeSet(industryId: string): DatalakeSet {
  return DATALAKE_SETS[getIndustry(industryId).setId] ?? watchesSet;
}

// ─── Generic helpers (set-aware) ──────────────────────────────────────────────

export function comboKey(ids: string[]): string {
  return [...ids].sort().join("+");
}

/**
 * Adjacency, symmetrised.
 *
 * In V1 `recommendedWith` is one-directional: Ads lists Pricing, Pricing does
 * not list Ads. That made the set of available tiles depend on the order the
 * user clicked in — starting from Ads offered Pricing, starting from Pricing
 * did not offer Ads. Reading the relation as undirected removes that.
 */
function adjacency(set: DatalakeSet): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  for (const d of set.datalakes) map[d.id] = new Set();

  for (const d of set.datalakes) {
    for (const other of d.recommendedWith) {
      if (!map[other]) continue; // ignore ids that aren't in this set
      map[d.id].add(other);
      map[other].add(d.id);
    }
  }
  return map;
}

const adjacencyCache = new Map<string, Record<string, Set<string>>>();

function getAdjacency(set: DatalakeSet): Record<string, Set<string>> {
  let cached = adjacencyCache.get(set.id);
  if (!cached) {
    cached = adjacency(set);
    adjacencyCache.set(set.id, cached);
  }
  return cached;
}

/** IDs that may still be added to the current selection (max 3). */
export function getCompatible(set: DatalakeSet, selectedIds: string[]): string[] {
  const all = set.datalakes.map((d) => d.id);
  if (selectedIds.length === 0) return all;
  if (selectedIds.length >= 3) return [];

  const adj = getAdjacency(set);
  return all.filter((id) => {
    if (selectedIds.includes(id)) return false;
    return selectedIds.every((selectedId) => adj[selectedId]?.has(id));
  });
}

export function getDatalake(set: DatalakeSet, id: string): Datalake | undefined {
  return set.datalakes.find((d) => d.id === id);
}

/**
 * Copy for the insight panel.
 *
 * Authored copy wins. When a reachable combination has none — and in V1 roughly
 * half of them had none, which rendered as an empty panel — fall back to a
 * composed line so the panel always says something.
 */
export function getDescription(set: DatalakeSet, selectedIds: string[]): string {
  if (selectedIds.length === 0) return "";

  if (selectedIds.length === 1) {
    return getDatalake(set, selectedIds[0])?.descriptionSingle ?? "";
  }

  const authored =
    selectedIds.length === 2
      ? set.pairDescriptions[comboKey(selectedIds)]
      : set.tripleDescriptions[comboKey(selectedIds)];

  if (authored) return authored;
  // An explicit "" means the set wants nothing shown for unwritten
  // combinations — distinct from the field being absent.
  if (set.fallbackDescription !== undefined) return set.fallbackDescription;

  const labels = selectedIds
    .map((id) => getDatalake(set, id)?.label)
    .filter(Boolean);

  if (labels.length < 2) return "";

  const last = labels[labels.length - 1];
  const head = labels.slice(0, -1).join(", ");

  return `Combine ${head} and ${last} to correlate signals that are usually read in isolation — and surface the shifts that only show up where these datasets overlap.`;
}
