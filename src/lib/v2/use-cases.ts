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
  role: string;
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
  /** Written by the client vs. placeholder. Drives the "draft" marker. */
  authored: boolean;
};

/**
 * ⚠️ Stand-in destination. The client wrote "URL" in the brief without giving
 * one and asked for a live link in the meantime ("живая ссылка, даже боджевая").
 * Swap for the real report/dashboard links before the call.
 */
const PLACEHOLDER_URL = "https://chife-mod.github.io/sfg-templates-viewer/";

/** Banking → Media. Client email of 2026-07-29, verbatim. */
const bankingMediaApps: UseCase[] = [
  {
    id: "banking-media-1",
    role: "PR",
    title: "Analyze Bank Media Mentions",
    overview:
      "Build monthly / weekly / daily reports covering bank (s) mentions in global and local media.",
    reportTemplateUrl: PLACEHOLDER_URL,
    authored: true,
  },
  {
    id: "banking-media-2",
    role: "PR",
    title: "UA Banks Media Benchmarking",
    // Overview is N/A in the brief — deliberately absent.
    reportTemplateUrl: PLACEHOLDER_URL,
    dashboardUrl: PLACEHOLDER_URL,
    authored: true,
  },
  {
    id: "banking-media-3",
    role: "PR",
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
    role: "PR & Comm Team",
    title: "Identify Media & Journalists",
    overview:
      "Watch Media · My Universe (with ability to tune competitors).",
    reportTemplateUrl: PLACEHOLDER_URL,
    authored: true,
  },
];

/** Placeholder apps, used wherever the client has not written real ones. */
const placeholderApps: UseCase[] = [
  {
    id: "lorem-1",
    role: "Lorem",
    title: "Lorem ipsum dolor sit amet consectetur",
    overview: "Adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    authored: false,
  },
  {
    id: "lorem-2",
    role: "Ipsum",
    title: "Ut enim ad minim veniam quis nostrud",
    overview: "Exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    authored: false,
  },
  {
    id: "lorem-3",
    role: "Dolor",
    title: "Duis aute irure dolor in reprehenderit",
    authored: false,
  },
];

/** Keyed `<setId>:<datalakeId>`. Only authored entries live here. */
const authoredApps: Record<string, UseCase[]> = {
  "banking:media": bankingMediaApps,
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
    useCases: authoredApps[`${setId}:${d.id}`] ?? placeholderApps,
  }));
}
