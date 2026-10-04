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
      /** The removed sections were locked by the student. */
      locked?: boolean;
    }
  | { kind: "class"; classIndex: number }
  | { kind: "pair"; classIndexes: [number, number] }
  | { kind: "all" };

export interface GeneratedSchedule {
  classes: { classIndex: number; sectionIds: string[] }[];
  daysOnCampus: number;
  /** Idle time between the first and last class of each day, summed. */
  gapMinutes: number;
  /** Earliest start and latest end of the week, minutes after midnight. */
  firstStart: number | null;
  lastEnd: number | null;
  closedSections: number;
  /** Sections without a set time; the rules cannot check them. */
  unannouncedSections: number;
}

export interface GenerateResult {
  /**
   * Up to `count` schedules: the best one for the sort key, then each next
   * best that is clearly different from the ones before it.
   */
  schedules: GeneratedSchedule[];
  /**
   * The time budget ran out. The schedules still follow every rule, but they
   * may not be the best ones and the list may be shorter than asked for.
   */
  stoppedEarly: boolean;
  /** Why nothing fits; filled only when that is proven. */
  reasons: Reason[];
  /** Rules in use that, turned off alone, would let a schedule fit. */
  relaxations: Rule[];
  stats: {
    /** Search nodes visited, across every search in this run. */
    nodes: number;
    elapsedMs: number;
  };
}

export interface GenerateOptions {
  /** How many schedules to return. Default 8. */
  count?: number;
  /** Stop searching after this many ms. Default 100. */
  budgetMs?: number;
}
