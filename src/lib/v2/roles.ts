/**
 * Role & Tasks centric view — BACKLOG §2.6, unparked 2026-08-04.
 *
 * The client's framing (call of 2026-08-03): "я вижу, я пиарщик — что я могу
 * с этой хренью делать применительно к моей роли". The data side was always
 * a pivot, not new content: every app already carries role tags, so a role
 * is just a different way through the same use-case registry.
 *
 * "All roles" is the neutral default — the module behaves exactly as before
 * until a role is picked.
 */

import { getUseCaseGroups, type UseCase } from "./use-cases";
import type { DatalakeSet } from "./datalakes";

export const ALL_ROLES = "all";

/** Canonical display order — team roles first, oversight last. */
const ROLE_ORDER = ["PR", "Marketing", "CX", "BI", "Dev", "C-Level"];

/** Unique role tags present in a set's authored apps, canonically ordered. */
export function getRolesForSet(set: DatalakeSet): string[] {
  const found = new Set<string>();
  const groups = getUseCaseGroups(
    set.id,
    set.datalakes.map((d) => ({ id: d.id, label: d.label, color: d.color }))
  );
  for (const g of groups) {
    for (const uc of g.useCases) {
      for (const role of uc.roles) found.add(role);
    }
  }
  return [...found].sort((a, b) => {
    const ia = ROLE_ORDER.indexOf(a);
    const ib = ROLE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export type RoleTask = {
  useCase: UseCase;
  datalakeId: string;
  datalakeLabel: string;
  color: string;
};

/** Every task the role can run, across all lakes of the set, grid order. */
export function getRoleTasks(set: DatalakeSet, roleId: string): RoleTask[] {
  const groups = getUseCaseGroups(
    set.id,
    set.datalakes.map((d) => ({ id: d.id, label: d.label, color: d.color }))
  );
  const tasks: RoleTask[] = [];
  for (const g of groups) {
    for (const uc of g.useCases) {
      if (roleId === ALL_ROLES || uc.roles.includes(roleId)) {
        tasks.push({
          useCase: uc,
          datalakeId: g.datalakeId,
          datalakeLabel: g.datalakeLabel,
          color: g.color,
        });
      }
    }
  }
  return tasks;
}

/** Lakes that have at least one task for the role — drives board dimming. */
export function getRoleDatalakeIds(set: DatalakeSet, roleId: string): string[] {
  return [...new Set(getRoleTasks(set, roleId).map((t) => t.datalakeId))];
}

/** Filters a use-case list down to a role ("all" passes everything). */
export function filterByRole(useCases: UseCase[], roleId: string): UseCase[] {
  if (roleId === ALL_ROLES) return useCases;
  return useCases.filter((uc) => uc.roles.includes(roleId));
}
