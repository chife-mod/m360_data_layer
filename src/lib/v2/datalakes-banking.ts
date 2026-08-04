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
 * Copy: every overview here is the client's own text, or an empty string where
 * he has not written one yet. No filler — lorem was removed on 2026-07-30
 * ("пускай будет пусто"), because an empty panel states the truth and invented
 * prose does not. Datasets still awaiting copy: Branches & ATMs, the four
 * Owned channels, Products & Services, Regulators, Payment Systems,
 * Search Demand.
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
    // ── Sources preview — the pilot dataset for the new overview structure
    //    (client call, 2026-08-03: "пока делаем только для одной группы").
    //    The three named sites are the client's own examples from the overview
    //    copy; the rest of the list and every volume figure are SAMPLE data
    //    chosen by me, not by him — flagged in BACKLOG.md §1.4.
    sources: [
      { name: "MinFin", domain: "minfin.com.ua", monthlyVolume: "3 400 / mo", image: "/assets/sources/minfin.png" },
      { name: "Vidhuk", domain: "vidhuk.ua", monthlyVolume: "1 850 / mo", image: "/assets/sources/vidhuk.png" },
      { name: "Banki.ua", domain: "banki.ua", monthlyVolume: "1 320 / mo", image: "/assets/sources/banki.png" },
      { name: "Finance.ua", domain: "finance.ua", monthlyVolume: "780 / mo", image: "/assets/sources/finance.png" },
      { name: "Bankchart", domain: "bankchart.com.ua", monthlyVolume: "510 / mo", image: "/assets/sources/bankchart.png" },
    ],
    sourcesTotal: 8,
    // ── Weekly insights — sample findings in the shape the client sketched on
    //    the 2026-08-03 call: the negativity leaders mirror his own words
    //    ("по объёмам печали у нас есть явные три лидера"), the other two show
    //    the range (a trend and a positive counter). SAMPLE data, not real
    //    measurements — flagged in BACKLOG.md §1.4.
    insights: [
      {
        id: "rb-negativity-leaders",
        tone: "negative",
        title: "Three banks drive most of the negative volume",
        detail: "Share of this week's negative reviews across all tracked sites.",
        ranking: [
          { label: "Ukreximbank", value: 34 },
          { label: "TAScombank", value: 28 },
          { label: "PUMB", value: 21 },
        ],
      },
      {
        id: "rb-card-blocks",
        tone: "negative",
        title: "Fastest-growing complaint: card blocks",
        detail:
          "Frozen cards and compliance holds dominate new 1★ reviews on MinFin and Vidhuk.",
        delta: "+38% WoW",
      },
      {
        id: "rb-support-speed",
        tone: "positive",
        title: "Support speed praised at Monobank",
        detail:
          "Response-time mentions trend positive for the third week running.",
        delta: "4.6★ avg",
      },
    ],
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
    descriptionSingle: "",
  },

  // ── Row 3 — owned channels ─────────────────────────────────────────────────
  {
    id: "owned-some",
    label: "Owned: SoMe",
    icon: "bk-owned-some",
    color: "#9333EA",
    recommendedWith: ["owned-blogs", "owned-ads", "kols-celebrities"],
    descriptionSingle: "",
  },
  {
    id: "owned-blogs",
    label: "Owned: Blogs",
    icon: "bk-owned-blogs",
    color: "#FF8000",
    recommendedWith: ["owned-some", "owned-newsletters", "search-demand"],
    descriptionSingle: "",
  },
  {
    id: "owned-ads",
    label: "Owned: Ads",
    icon: "bk-owned-ads",
    color: "#06B6D4",
    recommendedWith: ["owned-some", "owned-newsletters", "payment-systems"],
    descriptionSingle: "",
  },
  {
    id: "owned-newsletters",
    label: "Owned: Newsletters",
    icon: "bk-owned-newsletters",
    color: "#EC4899",
    recommendedWith: ["owned-blogs", "owned-ads", "products-services"],
    descriptionSingle: "",
  },

  // ── Row 4 — products, rules, demand ────────────────────────────────────────
  {
    id: "products-services",
    label: "Products & Services",
    icon: "bk-products-services",
    color: "#F472B6",
    recommendedWith: ["banks", "payment-systems", "reviews-apps"],
    descriptionSingle: "",
  },
  {
    id: "regulators",
    label: "Regulators",
    icon: "bk-regulators",
    color: "#00D4FF",
    recommendedWith: ["banks", "media", "payment-systems"],
    descriptionSingle: "",
  },
  {
    id: "payment-systems",
    label: "Payment Systems",
    icon: "bk-payment-systems",
    color: "#84CC16",
    recommendedWith: ["products-services", "regulators", "branches-atms"],
    descriptionSingle: "",
  },
  {
    id: "search-demand",
    label: "Search Demand",
    icon: "bk-search-demand",
    // Was #FF4560 — visually the same red as Media (#F43F5E), and the client
    // asked for the two to separate: "он должен быть какой-то зелёный"
    // (call, 2026-08-03). Emerald, distinct from the lime Payment Systems
    // beside it; clears 3:1 on #111539 with room to spare. DESIGN.md updated.
    color: "#34D399",
    recommendedWith: ["owned-blogs", "products-services", "media"],
    descriptionSingle: "",
  },
];

const key = (ids: string[]) => [...ids].sort().join("+");

/**
 * Pair copy — none written yet. An unwritten combination shows nothing rather
 * than filler (client, 2026-07-30: "пускай будет пусто").
 */
export const bankingPairs: Record<string, string> = {};

/** Triple copy — none written yet. Same rule as pairs. */
export const bankingTriples: Record<string, string> = {};

/**
 * Shown for combinations nobody has written copy for: deliberately empty.
 * An empty string is not "no fallback" — it is an explicit instruction to show
 * nothing, which `getDescription` honours (see the `!== undefined` check there).
 */
export const bankingFallback = "";

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
