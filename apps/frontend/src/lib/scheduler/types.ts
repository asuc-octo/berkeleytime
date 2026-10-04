/*
 * Public input and output types of the schedule generator. Inputs are a
 * structural subset of the GraphQL schedule types, so `IScheduleClass` and
 * `IScheduleEvent` can be passed in directly. See README.md for the pipeline.
 */

/** One weekly meeting of a section. `days` is Monday first. */
export interface GeneratorMeeting {
  days?: (boolean | null)[] | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface GeneratorSection {
  sectionId: string;
  /** LEC, DIS, LAB, ... A student takes one section per component. */
  component: string;
  /** ISO dates. Sections that never run in the same weeks cannot conflict. */
  startDate?: string | null;
  endDate?: string | null;
  meetings: GeneratorMeeting[];
  enrollment?: {
    latest?: {
      status?: string | null;
      enrolledCount: number;
      maxEnroll: number;
    } | null;
  } | null;
}

/** A class in the schedule: one lecture plus its own discussions and labs. */
export interface GeneratorClass {
  class: {
    primarySection?: GeneratorSection | null;
    sections: GeneratorSection[];
  };
  selectedSections: { sectionId: string }[];
  locked?: boolean | null;
  blockedSections?: string[] | null;
  lockedComponents?: string[] | null;
}

/** A busy time the student added. Always a hard constraint. */
export interface GeneratorEvent {
  days: (boolean | null)[];
  startTime: string;
  endTime: string;
}

/** Why no schedule exists. Class indexes refer to the input array. */
export type Reason =
  | { kind: "closed" | "events"; classIndex: number; component: string }
  | { kind: "class"; classIndex: number }
  | { kind: "pair"; classIndexes: [number, number] }
  | { kind: "all" };

/**
 * How good the results are guaranteed to be.
 * - optimal: the search finished with exact pruning.
 * - near-optimal: the search finished, but pruned with a relative gap after
 *   the soft budget, so each result costs at most (1 + gap) times the best.
 * - best-found: the hard budget stopped the search; no guarantee.
 */
export type Quality =
  | { kind: "optimal" }
  | { kind: "near-optimal"; gap: number }
  | { kind: "best-found" };

export interface ChosenSection {
  sectionId: string;
  /**
   * Sections that could replace this one without changing anything else:
   * same-time sections first, then other times that still fit.
   */
  backups: string[];
}

export interface GeneratedClassChoice {
  /** Index into the classes passed to generateSchedules. */
  classIndex: number;
  sections: ChosenSection[];
}

export interface GeneratedSchedule {
  classes: GeneratedClassChoice[];
  /** Preference cost; lower is better. Comparable only within one run. */
  cost: number;
  daysOnCampus: number;
  /** Time between classes on the same day, not counting passing time. */
  gapMinutes: number;
  closedSections: number;
}

export interface GenerateResult {
  schedules: GeneratedSchedule[];
  quality: Quality;
  /** Filled only when there are no schedules and the search finished. */
  reasons: Reason[];
  stats: {
    /** Search nodes visited, across every search in this run. */
    nodes: number;
    elapsedMs: number;
  };
}

export interface GenerateOptions {
  /** How many schedules to return. Default 8. */
  count?: number;
  /** Exact search until this many ms; then prune with `gap`. Default 150. */
  softBudgetMs?: number;
  /** Stop every search after this many ms. Default 500. */
  hardBudgetMs?: number;
  /** Relative tolerance used after the soft budget. Default 0.05 (5%). */
  gap?: number;
}
