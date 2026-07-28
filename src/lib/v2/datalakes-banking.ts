/**
 * Banking datalakes — 16, verbatim from the client email of 2026-07-28, point 4.
 *
 * The email lists them in four blocks of four, which maps one-to-one onto the
 * 4x4 grid, so the order here IS the grid order. Do not re-sort.
 *
 *   Banks / Media / KOLs: Finance / KOLs: Celebrities
 *   Owned: SoMe / Owned: Blogs / Owned: Ads / Owned: Newsletters
 *   Reviews: Banks / Reviews: Branches / Reviews: Banking Apps / Branches & ATMs
 *   Products & Services / Regulators / Payment Systems / Search Demand
 *
 * ⚠️ COPY IS PLACEHOLDER. The client has not written the banking descriptions
 * yet and asked for lorem ipsum. Literal lorem ipsum was not used because this
 * screen is being shown to Mastercard on 2026-07-30 — these lines are written in
 * the voice of the watches set so the demo reads as a product rather than a
 * wireframe. Every `descriptionSingle` below still needs the client's real text.
 *
 * Colours reuse the watches palette in the same grid positions, so neighbouring
 * tiles keep the contrast the original set was tuned for.
 */

import type { Datalake } from "./datalakes";

export const bankingDatalakes: Datalake[] = [
  // ── Row 1 — institutions and voices ────────────────────────────────────────
  {
    id: "banks",
    label: "Banks",
    icon: "bk-banks",
    color: "#46FEC3",
    recommendedWith: ["media", "reviews-banks", "products-services"],
    descriptionSingle:
      "Track competitive positioning across retail and commercial banks — presence, messaging, and how each institution shows up in the market over time.",
  },
  {
    id: "media",
    label: "Media",
    icon: "bk-media",
    color: "#F43F5E",
    recommendedWith: ["banks", "kols-finance", "regulators"],
    descriptionSingle:
      "Monitor how banks, products, and payment brands are covered across financial media and business press to understand narrative momentum.",
  },
  {
    id: "kols-finance",
    label: "KOLs: Finance",
    icon: "bk-kols-finance",
    color: "#2563EB",
    recommendedWith: ["media", "kols-celebrities", "owned-some"],
    descriptionSingle:
      "Identify finance creators and analysts shaping opinion on banking products, and measure the reach and tone of what they publish.",
  },
  {
    id: "kols-celebrities",
    label: "KOLs: Celebrities",
    icon: "bk-kols-celebrities",
    color: "#FBBF24",
    recommendedWith: ["kols-finance", "owned-some", "media"],
    descriptionSingle:
      "Track celebrity and mainstream endorsements around financial brands to see where mass-audience attention is being directed.",
  },

  // ── Row 2 — owned channels ─────────────────────────────────────────────────
  {
    id: "owned-some",
    label: "Owned: SoMe",
    icon: "bk-owned-some",
    color: "#9333EA",
    recommendedWith: ["owned-blogs", "owned-ads", "kols-celebrities"],
    descriptionSingle:
      "Measure activity and engagement across owned social accounts to detect what competitors publish, how often, and what actually lands.",
  },
  {
    id: "owned-blogs",
    label: "Owned: Blogs",
    icon: "bk-owned-blogs",
    color: "#FF8000",
    recommendedWith: ["owned-some", "owned-newsletters", "search-demand"],
    descriptionSingle:
      "Follow owned editorial and content hubs to see which themes competitors invest in and how their positioning shifts.",
  },
  {
    id: "owned-ads",
    label: "Owned: Ads",
    icon: "bk-owned-ads",
    color: "#06B6D4",
    recommendedWith: ["owned-some", "owned-newsletters", "payment-systems"],
    descriptionSingle:
      "Monitor paid campaigns across channels to detect promotional bursts, offer pressure, and shifts in acquisition strategy.",
  },
  {
    id: "owned-newsletters",
    label: "Owned: Newsletters",
    icon: "bk-owned-newsletters",
    color: "#EC4899",
    recommendedWith: ["owned-blogs", "owned-ads", "products-services"],
    descriptionSingle:
      "Track direct-to-customer newsletters to capture product announcements and offers before they reach wider channels.",
  },

  // ── Row 3 — customer experience ────────────────────────────────────────────
  {
    id: "reviews-banks",
    label: "Reviews: Banks",
    icon: "bk-reviews-banks",
    color: "#10B981",
    recommendedWith: ["banks", "reviews-apps", "reviews-branches"],
    descriptionSingle:
      "Track rating dynamics and sentiment shifts at institution level to identify reputation trends before they surface elsewhere.",
  },
  {
    id: "reviews-branches",
    label: "Reviews: Branches",
    icon: "bk-reviews-branches",
    color: "#4338CA",
    recommendedWith: ["reviews-banks", "branches-atms", "reviews-apps"],
    descriptionSingle:
      "Analyse location-level feedback to find where physical service quality diverges from the brand promise.",
  },
  {
    id: "reviews-apps",
    label: "Reviews: Banking Apps",
    icon: "bk-reviews-apps",
    color: "#FB923C",
    recommendedWith: ["reviews-banks", "products-services", "reviews-branches"],
    descriptionSingle:
      "Monitor app store ratings and review volume to catch release-driven sentiment swings and recurring product complaints.",
  },
  {
    id: "branches-atms",
    label: "Branches & ATMs",
    icon: "bk-branches-atms",
    color: "#7C3AED",
    recommendedWith: ["reviews-branches", "banks", "payment-systems"],
    descriptionSingle:
      "Map physical network coverage and changes in branch and ATM footprint across regions and competitors.",
  },

  // ── Row 4 — products, rules, demand ────────────────────────────────────────
  {
    id: "products-services",
    label: "Products & Services",
    icon: "bk-products-services",
    color: "#F472B6",
    recommendedWith: ["banks", "payment-systems", "reviews-apps"],
    descriptionSingle:
      "Track product line-ups, rates, fees, and feature changes across institutions to detect competitive moves as they launch.",
  },
  {
    id: "regulators",
    label: "Regulators",
    icon: "bk-regulators",
    color: "#00D4FF",
    recommendedWith: ["banks", "media", "payment-systems"],
    descriptionSingle:
      "Follow regulatory activity, rulings, and supervisory signals that reshape what institutions can offer and how they must communicate.",
  },
  {
    id: "payment-systems",
    label: "Payment Systems",
    icon: "bk-payment-systems",
    color: "#84CC16",
    recommendedWith: ["products-services", "regulators", "branches-atms"],
    descriptionSingle:
      "Track scheme-level presence, acceptance, and co-brand activity across issuers, merchants, and markets.",
  },
  {
    id: "search-demand",
    label: "Search Demand",
    icon: "bk-search-demand",
    color: "#FF4560",
    recommendedWith: ["owned-blogs", "products-services", "media"],
    descriptionSingle:
      "Measure what customers actively search for across products and providers to see where real demand is forming.",
  },
];

const key = (ids: string[]) => [...ids].sort().join("+");

/** ⚠️ Placeholder copy — see the file header. */
export const bankingPairs: Record<string, string> = {
  [key(["banks", "media"])]:
    "Compare institutional activity with how it is covered, and find the gap between what banks do and what the market hears about it.",
  [key(["banks", "reviews-banks"])]:
    "Correlate competitive positioning with customer sentiment to see where reputation lags behind market presence.",
  [key(["products-services", "payment-systems"])]:
    "Connect product line-ups with scheme-level acceptance to spot where distribution constrains what a product can actually reach.",
  [key(["media", "regulators"])]:
    "Track how regulatory action moves the narrative, and how quickly coverage follows a ruling.",
  [key(["reviews-apps", "products-services"])]:
    "Tie app sentiment to feature releases and identify which product changes drive satisfaction rather than noise.",
  [key(["owned-ads", "owned-some"])]:
    "Compare paid pressure with organic activity to see where budget is compensating for weak owned reach.",
  [key(["branches-atms", "reviews-branches"])]:
    "Overlay physical footprint with location sentiment to find where network coverage and service quality disagree.",
  [key(["kols-finance", "media"])]:
    "Compare creator-led commentary with mainstream coverage to detect narratives forming ahead of the press cycle.",
  [key(["search-demand", "products-services"])]:
    "Match active demand against available products to find categories the market wants and competitors have not filled.",
};

/** ⚠️ Placeholder copy — see the file header. */
export const bankingTriples: Record<string, string> = {
  [key(["banks", "media", "regulators"])]:
    "Reveal how regulatory pressure and media narrative together shape institutional positioning — and which banks are absorbing scrutiny rather than deflecting it.",
  [key(["products-services", "payment-systems", "regulators"])]:
    "Connect what can be offered, what can be accepted, and what is permitted, to see where product strategy meets its real constraints.",
  [key(["reviews-banks", "reviews-apps", "reviews-branches"])]:
    "Read reputation across every customer touchpoint at once to separate a channel problem from an institution-wide one.",
  [key(["owned-some", "owned-blogs", "owned-ads"])]:
    "Assemble the full owned-channel picture to see how consistently a competitor tells the same story across paid, social, and editorial.",
};

/**
 * Which banking datalakes are surfaced when the "available in AI chats" toggle
 * is on. Mirrors the intent of the watches subset: the public, crawlable
 * sources an LLM could plausibly have seen.
 */
export const bankingAiChatIds: string[] = [
  "media",
  "reviews-banks",
  "products-services",
  "banks",
  "regulators",
];
