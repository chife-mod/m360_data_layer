/**
 * Jobs to be Done — brief point 5: `M360 | Jobs to be Done == Use Case == App`.
 *
 * Shape is the client's, verbatim from the email:
 *   Role | Job | Dataset | Parameters | AI Report Template
 *
 * These hang off a single datalake, matching how the client described it on the
 * call — three to five jobs per lake — so the panel can list the jobs for
 * whatever is currently selected.
 *
 * ⚠️ EXACTLY ONE ENTRY BELOW IS REAL: the PR & Comm Team job for watches Media,
 * which the client wrote out in the email. Everything else is lorem, on the same
 * rule as the banking copy — filler must be obviously filler so nobody mistakes
 * an invented job for an agreed one.
 */

export type UseCase = {
  id: string;
  role: string;
  job: string;
  dataset: string;
  parameters: string;
  reportTemplate: string;
  /** Written by the client vs. placeholder. Drives the "draft" marker. */
  authored: boolean;
};

/** The client's own example — the only real job so far. */
const watchesMediaJobs: UseCase[] = [
  {
    id: "watches-media-pr",
    role: "PR & Comm Team",
    job: "Identify Media & Journalists",
    dataset: "Watch Media",
    parameters: "My Universe (with ability to tune competitors)",
    reportTemplate: "AI Report Template",
    authored: true,
  },
];

/** Placeholder jobs, used wherever the client has not written real ones. */
const placeholderJobs: UseCase[] = [
  {
    id: "lorem-1",
    role: "Lorem Ipsum Team",
    job: "Lorem ipsum dolor sit amet consectetur",
    dataset: "Lorem Dataset",
    parameters: "Adipiscing elit, sed do eiusmod",
    reportTemplate: "AI Report Template",
    authored: false,
  },
  {
    id: "lorem-2",
    role: "Dolor Sit Team",
    job: "Ut enim ad minim veniam quis nostrud",
    dataset: "Ipsum Dataset",
    parameters: "Exercitation ullamco laboris nisi",
    reportTemplate: "AI Report Template",
    authored: false,
  },
  {
    id: "lorem-3",
    role: "Consectetur Team",
    job: "Duis aute irure dolor in reprehenderit",
    dataset: "Elit Dataset",
    parameters: "Voluptate velit esse cillum dolore",
    reportTemplate: "AI Report Template",
    authored: false,
  },
];

/** Keyed `<setId>:<datalakeId>`. Only authored entries live here. */
const authoredJobs: Record<string, UseCase[]> = {
  "watches:media": watchesMediaJobs,
};

export type UseCaseGroup = {
  datalakeId: string;
  datalakeLabel: string;
  color: string;
  useCases: UseCase[];
};

/**
 * Jobs for the current selection, grouped by datalake so it stays obvious which
 * lake a job belongs to when two or three are selected.
 */
export function getUseCaseGroups(
  setId: string,
  selected: { id: string; label: string; color: string }[]
): UseCaseGroup[] {
  return selected.map((d) => ({
    datalakeId: d.id,
    datalakeLabel: d.label,
    color: d.color,
    useCases: authoredJobs[`${setId}:${d.id}`] ?? placeholderJobs,
  }));
}
