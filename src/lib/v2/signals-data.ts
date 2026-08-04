export type SignalConfig = {
  id: string;
  label: string;
  icon: string;
  color: string;
  recommendedWith: string[];
  descriptionSingle: string;
};

/**
 * All 16 signal IDs are now active and clickable.
 * Toggle "AI chats" filters a subset (handled in page.tsx).
 */
export const ALL_SIGNAL_IDS = [
  "brands", "media", "pricing", "categories",
  "social", "availability", "products", "influencers",
  "ads", "novelties", "newsletters", "evisibility",
  "retailers", "reviews", "seo", "support-chats",
];

export const ACTIVE_SIGNAL_IDS = ALL_SIGNAL_IDS;

export const signalConfigs: Record<string, SignalConfig> = {
  brands: {
    id: "brands",
    label: "Brands",
    icon: "brands",
    color: "#46FEC3",
    recommendedWith: ["pricing", "availability"],
    descriptionSingle:
      "Analyze brand positioning across retailers, media, and digital channels. Track visibility, competitive presence, and how brand perception evolves over time.",
  },
  media: {
    id: "media",
    label: "Media",
    icon: "media",
    color: "#F43F5E",
    recommendedWith: ["reviews", "seo"],
    descriptionSingle:
      "Monitor product and brand mentions across industry media, newsletters, and publications to understand narrative momentum and market exposure.",
  },
  pricing: {
    id: "pricing",
    label: "Pricing",
    icon: "pricing",
    color: "#2563EB",
    recommendedWith: ["availability", "retailers"],
    descriptionSingle:
      "Track price changes, discount activity, and competitive pricing dynamics across retailers and regions in real time.",
  },
  categories: {
    id: "categories",
    label: "Categories",
    icon: "categories",
    color: "#FBBF24",
    recommendedWith: ["products", "brands"],
    descriptionSingle:
      "Understand how products are structured within categories and how competitive landscape shifts across segments.",
  },
  social: {
    id: "social",
    label: "Social",
    icon: "social",
    color: "#9333EA",
    recommendedWith: ["influencers", "reviews"],
    descriptionSingle:
      "Measure brand and product activity across social platforms to detect engagement spikes and emerging conversations.",
  },
  availability: {
    id: "availability",
    label: "Availability",
    icon: "availability",
    color: "#FF8000",
    recommendedWith: ["pricing", "retailers"],
    descriptionSingle:
      "Monitor in-stock levels, distribution gaps, and product presence across retailers to detect supply inconsistencies.",
  },
  products: {
    id: "products",
    label: "Products",
    icon: "products",
    color: "#06B6D4",
    recommendedWith: ["categories", "novelties"],
    descriptionSingle:
      "Track product attributes, variants, and lifecycle changes across markets and sales channels.",
  },
  influencers: {
    id: "influencers",
    label: "Influencers",
    icon: "influencers",
    color: "#EC4899",
    recommendedWith: ["social", "media"],
    descriptionSingle:
      "Identify which influencers mention your products or competitors and measure reach and performance impact.",
  },
  ads: {
    id: "ads",
    label: "Ads",
    icon: "ads",
    color: "#10B981",
    recommendedWith: ["pricing", "retailers"],
    descriptionSingle:
      "Monitor paid activity across retailers and platforms to detect campaign bursts and promotional pressure.",
  },
  novelties: {
    id: "novelties",
    label: "Novelties",
    icon: "novelties",
    color: "#6258D8",
    recommendedWith: ["products", "pricing"],
    descriptionSingle:
      "Detect new product launches, assortment changes, and competitive SKU expansion across retailers.",
  },
  newsletters: {
    id: "newsletters",
    label: "Newsletters",
    icon: "newsletters",
    color: "#FB923C",
    recommendedWith: ["media", "brands"],
    descriptionSingle:
      "Track brand and product placements in retail and industry newsletters.",
  },
  evisibility: {
    id: "evisibility",
    label: "E-visibility",
    icon: "evisibility",
    color: "#7C3AED",
    recommendedWith: ["seo", "retailers"],
    descriptionSingle:
      "Measure product discoverability across search, category listings, and AI-driven surfaces.",
  },
  retailers: {
    id: "retailers",
    label: "Retailers",
    icon: "retailers",
    color: "#F472B6",
    recommendedWith: ["pricing", "availability"],
    descriptionSingle:
      "Analyze assortment structure, product placement, and competitive overlap across retailers.",
  },
  reviews: {
    id: "reviews",
    label: "Reviews",
    icon: "reviews",
    color: "#00D4FF",
    recommendedWith: ["brands", "social"],
    descriptionSingle:
      "Track rating dynamics, sentiment shifts, and review volume to identify reputation trends.",
  },
  seo: {
    id: "seo",
    label: "SEO & AI rankings",
    icon: "seo",
    color: "#84CC16",
    recommendedWith: ["evisibility", "media"],
    descriptionSingle:
      "Monitor search visibility and AI-generated result positioning to detect shifts in discoverability.",
  },
  "support-chats": {
    id: "support-chats",
    label: "Support Chats",
    icon: "support-chats",
    // Kept in sync with v2/sources-data.ts — #FF4560 clashed with Media's red
    // (palette change of 2026-08-03, see DESIGN.md).
    color: "#34D399",
    recommendedWith: ["reviews", "products"],
    descriptionSingle:
      "Analyze recurring product and service issues emerging from customer support interactions.",
  },
};

function comboKey(ids: string[]): string {
  return [...ids].sort().join("+");
}

export const watchesPairDescriptions: Record<string, string> = {
  [comboKey(["brands", "pricing"])]:
    "Understand how pricing strategy impacts brand positioning. Detect discount pressure, premium erosion, and price-led perception shifts.",
  [comboKey(["brands", "availability"])]:
    "Identify how stockouts and distribution gaps influence brand visibility and competitive shelf share.",
  [comboKey(["pricing", "availability"])]:
    "Correlate demand distortion by analyzing how price changes lead to stockouts, delayed restocks, or channel withdrawal.",
  [comboKey(["media", "reviews"])]:
    "Compare media narrative with customer sentiment to uncover gaps between perception and experience.",
  [comboKey(["social", "influencers"])]:
    "Measure how influencer activity drives social engagement and brand lift.",
  [comboKey(["categories", "products"])]:
    "Detect how product portfolio evolution reshapes competitive category structure.",
  [comboKey(["novelties", "pricing"])]:
    "Analyze launch pricing strategies and detect aggressive entry tactics by competitors.",
  [comboKey(["retailers", "pricing"])]:
    "Compare pricing strategies across retailers to detect channel conflicts and inconsistencies.",
  [comboKey(["retailers", "availability"])]:
    "Identify which retailers consistently lead or lag in assortment coverage and stock reliability.",
  [comboKey(["evisibility", "seo"])]:
    "Understand how search and AI ranking shifts impact product discoverability.",
};

export const watchesTripleDescriptions: Record<string, string> = {
  [comboKey(["brands", "availability", "pricing"])]:
    "Reveal how pricing strategy and distribution dynamics together shape brand performance. Detect revenue leakage, competitive pressure, and shelf share erosion before they impact market share.",
  [comboKey(["media", "reviews", "social"])]:
    "Connect narrative, sentiment, and engagement to uncover early signals of brand momentum or reputational risk.",
  [comboKey(["retailers", "pricing", "availability"])]:
    "Analyze how retailer-level pricing and stock behavior influence demand patterns and channel performance.",
  [comboKey(["products", "categories", "novelties"])]:
    "Track how assortment expansion and product launches reshape category structure and competitive intensity.",
  [comboKey(["evisibility", "seo", "retailers"])]:
    "Understand how discoverability across search and AI surfaces translates into real retail presence and assortment positioning.",
};

export function getInsightDescription(selectedIds: string[]): string {
  if (selectedIds.length === 1) {
    return signalConfigs[selectedIds[0]]?.descriptionSingle ?? "";
  }
  if (selectedIds.length === 2) {
    return watchesPairDescriptions[comboKey(selectedIds)] ?? "";
  }
  if (selectedIds.length === 3) {
    return watchesTripleDescriptions[comboKey(selectedIds)] ?? "";
  }
  return "";
}

/**
 * Returns IDs compatible with the current selection.
 * Compatibility: a signal is compatible if it appears in `recommendedWith`
 * of every currently selected signal.
 */
export function getCompatibleSignals(selectedIds: string[]): string[] {
  if (selectedIds.length === 0) return ALL_SIGNAL_IDS;
  if (selectedIds.length >= 3) return [];

  return ALL_SIGNAL_IDS.filter((id) => {
    if (selectedIds.includes(id)) return false;
    return selectedIds.every((selectedId) => {
      const config = signalConfigs[selectedId];
      return config?.recommendedWith.includes(id) ?? false;
    });
  });
}
