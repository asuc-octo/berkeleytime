/*
 * Public input and output types of the schedule generator. Inputs are a
 * structural subset of the GraphQL schedule types, so `IScheduleClass` and
 * `IScheduleEvent` can be passed in directly. See README.md.
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
  /** ISO dates. Sections that never run in the same weeks cannot clash. */
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

/** A busy time the student added. Never overlapped. */
export interface GeneratorEvent {
  days: (boolean | null)[];
  startTime: string;
  endTime: string;
}

/** A preference rule that can be turned off when nothing fits. */
export type Rule =
  | "earliestStart"
  | "latestEnd"
  | "avoidDays"
  | "onlyOpenSections";

/** Why no schedule exists. Class indexes refer to the input array. */
export type Reason =
  | {
      /** Which check removed every section of this component. */
      kind: "closed" | "hours" | "days" | "events";
      classIndex: number;
      component: string;
    }
  | { kind: "class"; classIndex: number }
  | { kind: "pair"; classIndexes: [number, number] }
  | { kind: "all" };

export interface Relaxation {
  rule: Rule;
  /** Schedules that fit without this rule, counted up to RELAXATION_CAP. */
  count: number;
}

export interface GeneratedSchedule {
  classes: { classIndex: number; sectionIds: string[] }[];
  daysOnCampus: number;
  /** Time between classes on the same day, not counting passing time. */
  gapMinutes: number;
  /** Earliest start and latest end of the week, minutes after midnight. */
  firstStart: number | null;
  lastEnd: number | null;
  closedSections: number;
}

export interface GenerateResult {
  /** Up to `count` schedules, in the chosen sort order. */
  schedules: GeneratedSchedule[];
  /** Schedules that pass every rule, counted until the search stops. */
  total: number;
  /**
   * True when the cap or the step limit stopped the search early, so the
   * sort only covered the `total` schedules found so far.
   */
  truncated: boolean;
  /** Why nothing fits, when there are no schedules. */
  reasons: Reason[];
  /** Rules that, turned off alone, would let schedules fit. */
  relaxations: Relaxation[];
  elapsedMs: number;
}

export interface GenerateOptions {
  /** How many schedules to return. Default 8. */
  count?: number;
  /** Stop listing schedules after this many. Default 20,000. */
  cap?: number;
}
