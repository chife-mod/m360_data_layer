/**
 * Banking datalakes — 16, verbatim from the client email of 2026-07-28, point 4.
 *
 * The email lists them in four blocks of four, which maps one-to-one onto the
 * 4x4 grid, so the order here IS the grid order. Do not re-sort.
 *
 *   Banks / Media / KOLs: Finance / KOLs: Celebrities
 *   Reviews: Banks / Reviews: Branches / Reviews: Banking Apps / Branches & ATMs
 *   Owned: SoMe / Owned: Blogs / Owned: Ads / Owned: Newsletters
 *   Products & Services / Regulators / Payment Systems / Search Demand
 *
 * Rows 2 and 3 swapped on 2026-07-30 ("Reviews after KOLs") — the client's
 * own reordering of his four blocks. Each lake keeps its colour.
 *
 * ⚠️ ALL COPY BELOW IS LOREM IPSUM, DELIBERATELY.
 * Only the labels come from the client. Lorem is used rather than plausible
 * English so that the client can tell at a glance which text is his and which
 * was never written — readable filler would be mistaken for approved copy.
 * Replace each string as the real text arrives; anything still in Latin is
 * still outstanding.
 *
 * Labels, ids, icons, colours and relations are real. Only the prose is filler.
 *
 * Colours reuse the watches palette in the same grid positions, so neighbouring
 * tiles keep the contrast the original set was tuned for.
 */

import type { Datalake } from "./datalakes";

const LOREM_A =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const LOREM_B =
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const LOREM_C =
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
const LOREM_D =
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export const bankingDatalakes: Datalake[] = [
  // ── Row 1 — institutions and voices ────────────────────────────────────────
  {
    id: "banks",
    label: "Banks",
    icon: "bk-banks",
    color: "#46FEC3",
    recommendedWith: ["media", "reviews-banks", "products-services"],
    // Real copy — client email, 2026-07-30.
    descriptionSingle:
      "Information regarding 50+ major Ukrainian banks, branches, executives, etc.",
  },
  {
    id: "media",
    label: "Media",
    icon: "bk-media",
    color: "#F43F5E",
    recommendedWith: ["banks", "kols-finance", "regulators"],
    // Real copy — client email, 2026-07-29. The only banking lake written so far.
    descriptionSingle:
      "Monitor and analyze mentions of over 50 Ukrainian banks in global / local and specialized media outlets. Detect sentiment, mentions in title, \"promo\" materials and more.",
  },
  {
    id: "kols-finance",
    label: "KOLs: Finance",
    icon: "bk-kols-finance",
    color: "#2563EB",
    recommendedWith: ["media", "kols-celebrities", "owned-some"],
    // Real copy — client email, 2026-07-30.
    descriptionSingle:
      "Track over 100 Ukrainian financial influencers covering banking, payments, investments and more.",
  },
  {
    id: "kols-celebrities",
    label: "KOLs: Celebrities",
    icon: "bk-kols-celebrities",
    color: "#FBBF24",
    recommendedWith: ["kols-finance", "owned-some", "media"],
    // Real copy — client email, 2026-07-30.
    descriptionSingle:
      "Track major Ukrainian celebrities in social media and understand how they cover banking, payments, investments and more.",
  },

  // ── Row 2 — customer experience ────────────────────────────────────────────
  {
    id: "reviews-banks",
    label: "Reviews: Banks",
    icon: "bk-reviews-banks",
    color: "#10B981",
    recommendedWith: ["banks", "reviews-apps", "reviews-branches"],
    // Real copy — client email, 2026-07-30 (second round).
    descriptionSingle:
      "Analyze reviews related to 50+ major Ukrainian banks across 8 major review sites such as MinFin, Vidhuk, Banki.ua and others.",
  },
  {
    id: "reviews-branches",
    label: "Reviews: Branches",
    icon: "bk-reviews-branches",
    color: "#6258D8",
    recommendedWith: ["reviews-banks", "branches-atms", "reviews-apps"],
    // Real copy — client email, 2026-07-30 (second round).
    descriptionSingle:
      "Analyze reviews related to branches of 50+ Ukrainian banks on Google Maps and other review sites.",
  },
  {
    id: "reviews-apps",
    label: "Reviews: Banking Apps",
    icon: "bk-reviews-apps",
    color: "#FB923C",
    recommendedWith: ["reviews-banks", "products-services", "reviews-branches"],
    // Real copy — client email, 2026-07-30 (second round).
    descriptionSingle:
      "Analyze reviews related to mobile apps of 50+ Ukrainian banks (Google Play and Apple Store).",
  },
  {
    id: "branches-atms",
    label: "Branches & ATMs",
    icon: "bk-branches-atms",
    color: "#7C3AED",
    recommendedWith: ["reviews-branches", "banks", "payment-systems"],
    descriptionSingle: LOREM_D,
  },

  // ── Row 3 — owned channels ─────────────────────────────────────────────────
  {
    id: "owned-some",
    label: "Owned: SoMe",
    icon: "bk-owned-some",
    color: "#9333EA",
    recommendedWith: ["owned-blogs", "owned-ads", "kols-celebrities"],
    descriptionSingle: LOREM_A,
  },
  {
    id: "owned-blogs",
    label: "Owned: Blogs",
    icon: "bk-owned-blogs",
    color: "#FF8000",
    recommendedWith: ["owned-some", "owned-newsletters", "search-demand"],
    descriptionSingle: LOREM_B,
  },
  {
    id: "owned-ads",
    label: "Owned: Ads",
    icon: "bk-owned-ads",
    color: "#06B6D4",
    recommendedWith: ["owned-some", "owned-newsletters", "payment-systems"],
    descriptionSingle: LOREM_C,
  },
  {
    id: "owned-newsletters",
    label: "Owned: Newsletters",
    icon: "bk-owned-newsletters",
    color: "#EC4899",
    recommendedWith: ["owned-blogs", "owned-ads", "products-services"],
    descriptionSingle: LOREM_D,
  },

  // ── Row 4 — products, rules, demand ────────────────────────────────────────
  {
    id: "products-services",
    label: "Products & Services",
    icon: "bk-products-services",
    color: "#F472B6",
    recommendedWith: ["banks", "payment-systems", "reviews-apps"],
    descriptionSingle: LOREM_A,
  },
  {
    id: "regulators",
    label: "Regulators",
    icon: "bk-regulators",
    color: "#00D4FF",
    recommendedWith: ["banks", "media", "payment-systems"],
    descriptionSingle: LOREM_B,
  },
  {
    id: "payment-systems",
    label: "Payment Systems",
    icon: "bk-payment-systems",
    color: "#84CC16",
    recommendedWith: ["products-services", "regulators", "branches-atms"],
    descriptionSingle: LOREM_C,
  },
  {
    id: "search-demand",
    label: "Search Demand",
    icon: "bk-search-demand",
    color: "#FF4560",
    recommendedWith: ["owned-blogs", "products-services", "media"],
    descriptionSingle: LOREM_D,
  },
];

const key = (ids: string[]) => [...ids].sort().join("+");

/** ⚠️ Lorem — see the file header. */
export const bankingPairs: Record<string, string> = {
  [key(["banks", "media"])]: `${LOREM_A} ${LOREM_B}`,
  [key(["banks", "reviews-banks"])]: `${LOREM_B} ${LOREM_C}`,
  [key(["products-services", "payment-systems"])]: `${LOREM_C} ${LOREM_D}`,
  [key(["media", "regulators"])]: `${LOREM_D} ${LOREM_A}`,
  [key(["reviews-apps", "products-services"])]: `${LOREM_A} ${LOREM_C}`,
  [key(["owned-ads", "owned-some"])]: `${LOREM_B} ${LOREM_D}`,
  [key(["branches-atms", "reviews-branches"])]: `${LOREM_C} ${LOREM_A}`,
  [key(["kols-finance", "media"])]: `${LOREM_D} ${LOREM_B}`,
  [key(["search-demand", "products-services"])]: `${LOREM_A} ${LOREM_D}`,
};

/** ⚠️ Lorem — see the file header. */
export const bankingTriples: Record<string, string> = {
  [key(["banks", "media", "regulators"])]: `${LOREM_A} ${LOREM_B} ${LOREM_C}`,
  [key(["products-services", "payment-systems", "regulators"])]: `${LOREM_B} ${LOREM_C} ${LOREM_D}`,
  [key(["reviews-banks", "reviews-apps", "reviews-branches"])]: `${LOREM_C} ${LOREM_D} ${LOREM_A}`,
  [key(["owned-some", "owned-blogs", "owned-ads"])]: `${LOREM_D} ${LOREM_A} ${LOREM_B}`,
};

/**
 * Shown for combinations nobody has written copy for.
 *
 * The watches set composes an English sentence from the labels; banking must
 * not, or an unwritten combination would read as finished copy and undo the
 * point of using lorem everywhere else.
 */
export const bankingFallback = `${LOREM_B} ${LOREM_C}`;

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
