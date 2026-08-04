/**
 * Tasks & Apps — brief point 5: `M360 | Jobs to be Done == Use Case == App`.
 *
 * Client email of 2026-07-29 supplies the first real set: three apps for the
 * Banking → Media lake, for the Mastercard call on 2026-07-30.
 *
 * Card shape follows that email:
 *   Role | Title | Overview (may be N/A) | Report Template | Dashboard
 *
 * Two things the email adds over the previous shape:
 *   - Overview is optional. "in some apps there may be no description, that is
 *     normal" — the row is hidden rather than printed as N/A.
 *   - Title may depend on the Type selector, hence the `{type}` placeholder.
 */

export type UseCase = {
  id: string;
  /**
   * Role tags — brief of 2026-07-30 introduces multi-role apps
   * ("Roles: [MARKETING] [PR] [CX] [BI] [C-LEVEL]"), so this is a list even
   * where there is only one.
   */
  roles: string[];
  /**
   * `{type}` is replaced with the current Type selector label, so App #3 reads
   * "…but not My Bank" or "…but not My Payment System" depending on who is
   * looking. Client note: "Change title dynamically depending on Type".
   */
  title: string;
  /** Omitted when the client marked it N/A — the row is then not rendered. */
  overview?: string;
  reportTemplateUrl?: string;
  dashboardUrl?: string;
  /**
   * Captured pages of the report, shown as a swipeable strip in the popup.
   * `dir` is a folder under public/assets/reports, filled by
   * scripts/capture-report-slides.js.
   */
  reportPreview?: { dir: string; count: number };
  /** Written by the client vs. placeholder. Drives the "draft" marker. */
  authored: boolean;
};

// Real destinations from the client email of 2026-07-29. The pasted text only
// carried the anchor word "URL"; the hrefs came from the message itself.
export const PUMB_MONTHLY_PULSE = "https://chife-mod.github.io/sf-pumb-monthly-pulse/";
const VULCAIN_MONTHLY_PULSE = "https://chife-mod.github.io/sf-vulcain-monthly-pulse/";
// Direct dashboard URL as supplied by the client on 2026-07-29. The email
// carried the sf-bi.ai/4fqUseZ short link to the same place; this is the
// unshortened one, so it does not depend on the shortener staying alive.
const BENCHMARKING_360 =
  "https://chife-mod.github.io/sf-mastercard-benchmarking360/";
const INFLUENCER_PULSE =
  "https://chife-mod.github.io/sf-aayed-influencer-pulse/";
const KOLS_FINANCE_DASHBOARD = "https://sf-bi.ai/4yOUvZE";
const REVIEWS_SITES_DASHBOARD = "https://sf-bi.ai/4bPUieM";
const REVIEWS_APPS_DASHBOARD = "https://sf-bi.ai/4xetb5B";
const KOLS_CELEBRITIES_DASHBOARD = "https://sf-bi.ai/4yOUVPI";
const UA_BANKS_DASHBOARD =
  "https://app.semanticforce.ai/?_gl=1*1p3dqyu*_gcl_au*MTk4NzYxOTYyNC4xNzgzOTI5NDgy#/dashboard/insights/custom/ua/banks_news?sign=beded70bddb60a228a1d38bfe5d14dbb722cd80d";

/** Banking → Media. Client email of 2026-07-29, verbatim. */
const bankingMediaApps: UseCase[] = [
  {
    id: "banking-media-1",
    roles: ["PR"],
    title: "Analyze Bank Media Mentions",
    overview:
      "Build monthly / weekly / daily reports covering bank (s) mentions in global and local media.",
    reportTemplateUrl: PUMB_MONTHLY_PULSE,
    reportPreview: { dir: "pumb", count: 12 },
    authored: true,
  },
  {
    id: "banking-media-2",
    roles: ["PR"],
    title: "UA Banks Media Benchmarking",
    // Overview is N/A in the brief — deliberately absent.
    reportTemplateUrl: VULCAIN_MONTHLY_PULSE,
    dashboardUrl: UA_BANKS_DASHBOARD,
    reportPreview: { dir: "vulcain", count: 25 },
    authored: true,
  },
  {
    id: "banking-media-3",
    roles: ["PR"],
    title: "Discover Sources where Competitors Covered, but not My {type}",
    overview:
      "Create report providing sources, journalists and benchmarking related to key competitors.",
    // Report Template is N/A in the brief.
    authored: true,
  },
];

/** The client's earlier watches example, kept as-is. */
const watchesMediaApps: UseCase[] = [
  {
    id: "watches-media-pr",
    roles: ["PR & Comm Team"],
    title: "Identify Media & Journalists",
    overview:
      "Watch Media · My Universe (with ability to tune competitors).",
    reportTemplateUrl: PUMB_MONTHLY_PULSE,
    reportPreview: { dir: "pumb", count: 12 },
    authored: true,
  },
];

/**
 * Banking → Banks ("Egg 1"). Brief of 2026-07-30: the UA Banks
 * Benchmarking 360 report embedded as an app, tagged for every team it
 * serves. The lorem drafts stay behind it — the client fills them in one by
 * one ("мы просто пойдём и каждому будем дописывать").
 */
const bankingBanksApps: UseCase[] = [
  {
    id: "banking-banks-benchmark",
    roles: ["Marketing", "PR", "CX", "BI", "C-Level"],
    title: "Benchmark UA Banks",
    reportTemplateUrl: BENCHMARKING_360,
    reportPreview: { dir: "benchmarking360", count: 3 },
    authored: true,
  },
];

/** Banking → KOLs — client email of 2026-07-30, verbatim. */
const kolsFinanceApps: UseCase[] = [
  {
    id: "banking-kols-finance-benchmark",
    roles: ["PR", "Marketing"],
    title: "Influencers Benchmarking",
    // No overview in the brief — just the dashboard.
    dashboardUrl: KOLS_FINANCE_DASHBOARD,
    authored: true,
  },
  {
    id: "banking-kols-finance-analytics",
    roles: ["PR", "Marketing"],
    title: "Influencer Analytics",
    overview: "Analyze Influencer Activity.",
    reportTemplateUrl: INFLUENCER_PULSE,
    reportPreview: { dir: "influencer-pulse", count: 10 },
    authored: true,
  },
];

const kolsCelebritiesApps: UseCase[] = [
  {
    id: "banking-kols-celebrities-benchmark",
    roles: ["PR", "Marketing"],
    title: "Influencers Benchmarking",
    dashboardUrl: KOLS_CELEBRITIES_DASHBOARD,
    authored: true,
  },
  {
    id: "banking-kols-celebrities-analytics",
    roles: ["PR", "Marketing"],
    title: "Influencer Analytics",
    overview: "Analyze Influencer Activity.",
    reportTemplateUrl: INFLUENCER_PULSE,
    reportPreview: { dir: "influencer-pulse", count: 10 },
    authored: true,
  },
];

/** Keyed `<setId>:<datalakeId>`. Only authored entries live here. */
/**
 * Banking → the Reviews row — client email of 2026-07-30 (second round).
 *
 * All three are dashboards, not decks, so there is no preview strip: the URLs
 * are live BI views behind app.semanticforce.ai.
 *
 * Reviews: Banks and Reviews: Branches point at the SAME dashboard
 * (sf-bi.ai/4bPUieM) — as written in the brief. Flagged with the client in
 * case one of them was meant to be its own view.
 */
const reviewsBanksApps: UseCase[] = [
  {
    id: "banking-reviews-banks-benchmark",
    roles: ["CX", "Marketing"],
    title: "Benchmark banks in review sites",
    overview: "Understand drivers of positivity and negativity.",
    dashboardUrl: REVIEWS_SITES_DASHBOARD,
    authored: true,
  },
];

const reviewsBranchesApps: UseCase[] = [
  {
    id: "banking-reviews-branches-benchmark",
    roles: ["CX", "Marketing"],
    title: "Benchmark Bank Branches & ATMs",
    overview: "Understand drivers of positivity and negativity.",
    dashboardUrl: REVIEWS_SITES_DASHBOARD,
    authored: true,
  },
];

const reviewsAppsApps: UseCase[] = [
  {
    id: "banking-reviews-apps-benchmark",
    roles: ["CX", "Marketing", "Dev"],
    title: "Benchmark Apps",
    overview:
      "Understand drivers of positivity and negativity. Track perception of new features and more.",
    dashboardUrl: REVIEWS_APPS_DASHBOARD,
    authored: true,
  },
];

const authoredApps: Record<string, UseCase[]> = {
  "banking:media": bankingMediaApps,
  "banking:banks": bankingBanksApps,
  "banking:kols-finance": kolsFinanceApps,
  "banking:kols-celebrities": kolsCelebritiesApps,
  "banking:reviews-banks": reviewsBanksApps,
  "banking:reviews-branches": reviewsBranchesApps,
  "banking:reviews-apps": reviewsAppsApps,
  "watches:media": watchesMediaApps,
};

export type UseCaseGroup = {
  datalakeId: string;
  datalakeLabel: string;
  color: string;
  useCases: UseCase[];
};

/** Substitutes the Type selector label into a title template. */
export function resolveTitle(title: string, typeLabel: string): string {
  return title.replace(/\{type\}/g, typeLabel);
}

/**
 * Find an app by id anywhere in a set — the history section needs the live
 * UseCase behind a journal entry to offer Rebuild, and the entry may refer to
 * an app outside the current selection.
 */
export function findUseCase(
  setId: string,
  useCaseId: string
): UseCase | undefined {
  for (const [key, cases] of Object.entries(authoredApps)) {
    if (!key.startsWith(`${setId}:`)) continue;
    const hit = cases.find((c) => c.id === useCaseId);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * Apps for the current selection, grouped by datalake so it stays obvious which
 * lake an app belongs to when two or three are selected.
 */
export function getUseCaseGroups(
  setId: string,
  selected: { id: string; label: string; color: string }[]
): UseCaseGroup[] {
  return selected.map((d) => ({
    datalakeId: d.id,
    datalakeLabel: d.label,
    color: d.color,
    // No lorem stand-ins any more (client, 2026-07-30) — a lake with nothing
    // written simply has an empty list, and the tab says [0].
    useCases: authoredApps[`${setId}:${d.id}`] ?? [],
  }));
}
