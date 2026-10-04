import { SortKey } from "./preferences";

/** The numbers a schedule is sorted by. */
export interface Totals {
  /** Idle minutes between the first and last class of each day, summed. */
  gapMinutes: number;
  daysOnCampus: number;
  closedSections: number;
  /** Earliest start of the week; Infinity when nothing has a time. */
  firstStart: number;
  /** Latest end of the week; -Infinity when nothing has a time. */
  lastEnd: number;
}

const DAY = 24 * 60;

/** Days in a bitmask where bit d means day d. */
export const countDays = (days: number) => {
  let count = 0;
  for (let rest = days; rest; rest &= rest - 1) count++;
  return count;
};

type Term = keyof Totals;

/** Each sort key followed by its tie-breaks, most important first. */
const ORDER: Record<SortKey, Term[]> = {
  "fewest-gaps": ["gapMinutes", "closedSections", "daysOnCampus"],
  "fewest-days": ["daysOnCampus", "closedSections", "gapMinutes"],
  "latest-start": [
    "firstStart",
    "closedSections",
    "gapMinutes",
    "daysOnCampus",
  ],
  "earliest-finish": [
    "lastEnd",
    "closedSections",
    "gapMinutes",
    "daysOnCampus",
  ],
};

/** Largest value a term can take, so the weights below keep the order. */
const largest = (term: Term, choiceCount: number) =>
  term === "gapMinutes"
    ? 7 * DAY
    : term === "daysOnCampus"
      ? 7
      : term === "closedSections"
        ? choiceCount
        : DAY;

/** Weight of each term in the cost; 0 for terms the sort key ignores. */
export type Objective = Record<Term, number>;

/**
 * Turns the sort key and its tie-breaks into weights for one number to
 * minimize (README.md, "Objective"). Each term's weight is larger than the
 * most all later terms can add up to, so comparing costs gives the same
 * order as comparing the terms one by one.
 */
export const createObjective = (
  sortBy: SortKey,
  choiceCount: number
): Objective => {
  const objective: Objective = {
    gapMinutes: 0,
    daysOnCampus: 0,
    closedSections: 0,
    firstStart: 0,
    lastEnd: 0,
  };

  let weight = 1;
  for (const term of [...ORDER[sortBy]].reverse()) {
    objective[term] = weight;
    weight *= largest(term, choiceCount) + 1;
  }

  return objective;
};

/**
 * The cost of a schedule; lower is better. Never decreases when gaps, days,
 * closed sections or the last end grow, or when the first start moves
 * earlier, so lower bounds on those give a lower bound on the cost.
 */
export const costOf = (objective: Objective, totals: Totals) =>
  objective.gapMinutes * totals.gapMinutes +
  objective.daysOnCampus * totals.daysOnCampus +
  objective.closedSections * totals.closedSections +
  objective.firstStart * (DAY - Math.min(DAY, totals.firstStart)) +
  objective.lastEnd * Math.max(0, totals.lastEnd);
