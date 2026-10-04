import { WEIGHTS, isClosed, slotCost } from "./objective";
import { GeneratorPreferences } from "./preferences";
import {
  DateRange,
  Interval,
  classMinutes,
  intervalsOverlap,
  rangesOverlap,
  toBusyIntervals,
  toDateRange,
  toIntervals,
} from "./time";
import {
  GeneratorClass,
  GeneratorEvent,
  GeneratorSection,
  Reason,
} from "./types";

/** Sections of one component that meet at exactly the same times and weeks. */
export interface Slot {
  /** Index of the variable this slot belongs to. */
  variable: number;
  sections: GeneratorSection[];
  intervals: Interval[];
  range: DateRange;
  /** Bit d is set when the slot meets on day d (0 = Monday). */
  dayMask: number;
  /** Per-slot part of the score. */
  cost: number;
  /** Ids of slots in other variables that overlap this one. */
  conflicts: number[];
}

/** One decision: which slot to use for one component of one class. */
export interface Variable {
  classIndex: number;
  component: string;
  /** Slot ids, cheapest first. */
  slots: number[];
}

export interface Problem {
  variables: Variable[];
  slots: Slot[];
  /** conflictMatrix[a * slots.length + b] is 1 when slots a and b overlap. */
  conflictMatrix: Uint8Array;
  /** Set when some variable has no usable slot; nothing else is searched. */
  reasons: Reason[];
  avoidMask: number;
  preferences: GeneratorPreferences;
}

interface Group {
  component: string;
  candidates: GeneratorSection[];
  /** Locked by the student: never filtered. */
  fixed: boolean;
}

/**
 * Applies lock and block settings and groups a class's sections by
 * component. A component with every section excluded comes back empty and
 * is left out of generation, matching the old generator.
 */
const toGroups = (scheduleClass: GeneratorClass): Group[] => {
  const { primarySection, sections } = scheduleClass.class;
  const all = [primarySection, ...sections].filter(
    (section): section is GeneratorSection => !!section
  );
  const selected = new Set(
    scheduleClass.selectedSections.map(({ sectionId }) => String(sectionId))
  );
  const isSelected = (section: GeneratorSection) =>
    selected.has(String(section.sectionId));

  // A locked class keeps exactly the sections it has.
  if (scheduleClass.locked)
    return all.filter(isSelected).map((section) => ({
      component: section.component,
      candidates: [section],
      fixed: true,
    }));

  const blocked = new Set((scheduleClass.blockedSections ?? []).map(String));
  const lockedComponents = scheduleClass.lockedComponents ?? [];
  const byComponent = new Map<string, GeneratorSection[]>();
  for (const section of all)
    byComponent.set(section.component, [
      ...(byComponent.get(section.component) ?? []),
      section,
    ]);

  return [...byComponent].map(([component, group]) => {
    // A locked component with nothing selected is treated as unlocked.
    const kept = lockedComponents.includes(component)
      ? group.filter(isSelected)
      : [];

    return kept.length > 0
      ? { component, candidates: kept, fixed: true }
      : {
          component,
          candidates: group.filter(
            (section) => !blocked.has(String(section.sectionId))
          ),
          fixed: false,
        };
  });
};

const slotKey = (intervals: Interval[], range: DateRange) =>
  `${range.first}:${range.last}|${intervals
    .map(({ day, start, end }) => `${day}:${start}-${end}`)
    .sort()
    .join("|")}`;

/**
 * Builds the search problem: one variable per (class, component), sections
 * merged into time slots, slots that hit a busy time removed, and a table of
 * which slots overlap.
 */
export const buildProblem = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences
): Problem => {
  const busy = toBusyIntervals(events);
  const variables: Variable[] = [];
  const slots: Slot[] = [];
  const reasons: Reason[] = [];

  classes.forEach((scheduleClass, classIndex) => {
    for (const { component, candidates, fixed } of toGroups(scheduleClass)) {
      if (candidates.length === 0) continue;

      const open =
        fixed || !preferences.onlyOpenSections
          ? candidates
          : candidates.filter((section) => !isClosed(section));
      const free = open.filter(
        (section) => !intervalsOverlap(toIntervals(section.meetings), busy)
      );

      if (open.length === 0)
        reasons.push({ kind: "closed", classIndex, component });
      else if (free.length === 0)
        reasons.push({ kind: "events", classIndex, component });

      // Merge sections that are interchangeable for scheduling.
      const byTime = new Map<string, GeneratorSection[]>();
      for (const section of free) {
        const key = slotKey(
          toIntervals(section.meetings),
          toDateRange(section)
        );
        byTime.set(key, [...(byTime.get(key) ?? []), section]);
      }

      const variable = variables.length;
      const ids: number[] = [];
      for (const group of byTime.values()) {
        const intervals = toIntervals(group[0].meetings);
        ids.push(slots.length);
        slots.push({
          variable,
          sections: group,
          intervals,
          range: toDateRange(group[0]),
          dayMask: intervals.reduce((mask, { day }) => mask | (1 << day), 0),
          cost: slotCost(intervals, group, preferences),
          conflicts: [],
        });
      }

      if (preferences.fewerGaps) {
        // Gap time = time on campus - class time. Charging the class-time part
        // per slot keeps the time-on-campus part monotone (README.md).
        const most = Math.max(
          0,
          ...ids.map((id) => classMinutes(slots[id].intervals))
        );
        for (const id of ids)
          slots[id].cost +=
            WEIGHTS.timeOnCampus * (most - classMinutes(slots[id].intervals));
      }

      ids.sort((a, b) => slots[a].cost - slots[b].cost);
      variables.push({ classIndex, component, slots: ids });
    }
  });

  const n = slots.length;
  const conflictMatrix = new Uint8Array(n * n);
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      if (
        slots[a].variable !== slots[b].variable &&
        rangesOverlap(slots[a].range, slots[b].range) &&
        intervalsOverlap(slots[a].intervals, slots[b].intervals)
      ) {
        conflictMatrix[a * n + b] = conflictMatrix[b * n + a] = 1;
        slots[a].conflicts.push(b);
        slots[b].conflicts.push(a);
      }

  return {
    variables,
    slots,
    conflictMatrix,
    reasons,
    avoidMask: preferences.avoidDays.reduce(
      (mask, avoid, day) => (avoid ? mask | (1 << day) : mask),
      0
    ),
    preferences,
  };
};
