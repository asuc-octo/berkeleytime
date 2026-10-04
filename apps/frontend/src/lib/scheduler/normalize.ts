import { GeneratorPreferences } from "./preferences";
import {
  DateRange,
  Interval,
  intervalsOverlap,
  rangesOverlap,
  toDateRange,
  toIntervals,
} from "./time";
import {
  GeneratorClass,
  GeneratorEvent,
  GeneratorSection,
  Reason,
} from "./types";

/**
 * One way to fill a choice: all sections of that component which meet at
 * exactly the same times in the same weeks. They are interchangeable for
 * scheduling, so the search treats them as one option.
 */
export interface Option {
  /** Index of the choice this option belongs to. */
  choice: number;
  /** The section to use: the student's current one if it is here, else the one most likely to have a seat. */
  section: GeneratorSection;
  intervals: Interval[];
  range: DateRange;
}

/** One decision: which option to use for one component of one class. */
export interface Choice {
  classIndex: number;
  component: string;
  /** Option ids. */
  options: number[];
}

export interface Problem {
  choices: Choice[];
  options: Option[];
  /** clashes[a * options.length + b] is 1 when options a and b overlap. */
  clashes: Uint8Array;
  /** Set when a rule or busy time removed every section of a component. */
  reasons: Reason[];
}

export const isClosed = (section: GeneratorSection) =>
  section.enrollment?.latest?.status === "C";

const fill = (section: GeneratorSection) => {
  const latest = section.enrollment?.latest;
  return latest && latest.maxEnroll > 0
    ? latest.enrolledCount / latest.maxEnroll
    : 0;
};

/** Open before closed, then the emptiest first. */
const bySeatAvailability = (a: GeneratorSection, b: GeneratorSection) =>
  Number(isClosed(a)) - Number(isClosed(b)) || fill(a) - fill(b);

type CheckKind = "closed" | "hours" | "days" | "events";

interface Group {
  component: string;
  candidates: GeneratorSection[];
  /** Locked by the student: rules never remove these. */
  locked: boolean;
}

/**
 * Groups a class's sections by component after applying locks and
 * exclusions. A component with every section excluded comes back empty and
 * is left out of generation, as in the old generator.
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
      locked: true,
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
      ? { component, candidates: kept, locked: true }
      : {
          component,
          candidates: group.filter(
            (section) => !blocked.has(String(section.sectionId))
          ),
          locked: false,
        };
  });
};

/**
 * The checks every section must pass, in order. The first check that
 * removes every remaining section becomes the reason shown to the student.
 */
const checks = (
  preferences: GeneratorPreferences,
  busy: Interval[],
  locked: boolean
): [
  CheckKind,
  (intervals: Interval[], section: GeneratorSection) => boolean,
][] => {
  const { earliestStart, latestEnd, avoidDays, onlyOpenSections } = preferences;
  // Busy times apply to every section; the rules skip locked ones.
  const busyCheck: [CheckKind, (intervals: Interval[]) => boolean] = [
    "events",
    (intervals) => !intervalsOverlap(intervals, busy),
  ];
  if (locked) return [busyCheck];

  return [
    ["closed", (_, section) => !onlyOpenSections || !isClosed(section)],
    [
      "hours",
      (intervals) =>
        intervals.every(
          ({ start, end }) =>
            (earliestStart === null || start >= earliestStart) &&
            (latestEnd === null || end <= latestEnd)
        ),
    ],
    ["days", (intervals) => intervals.every(({ day }) => !avoidDays[day])],
    busyCheck,
  ];
};

const optionKey = (intervals: Interval[], range: DateRange) =>
  `${range.first}:${range.last}|${intervals
    .map(({ day, start, end }) => `${day}:${start}-${end}`)
    .sort()
    .join("|")}`;

/**
 * Builds the search problem: one choice per (class, component), with
 * sections filtered by the rules and merged into options, plus a table of
 * which options overlap.
 */
export const buildProblem = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences
): Problem => {
  const busy = toIntervals(events);
  const choices: Choice[] = [];
  const options: Option[] = [];
  const reasons: Reason[] = [];

  classes.forEach((scheduleClass, classIndex) => {
    const selected = new Set(
      scheduleClass.selectedSections.map(({ sectionId }) => String(sectionId))
    );

    for (const { component, candidates, locked } of toGroups(scheduleClass)) {
      if (candidates.length === 0) continue;

      let kept = candidates;
      for (const [kind, passes] of checks(preferences, busy, locked)) {
        kept = kept.filter((section) =>
          passes(toIntervals(section.meetings), section)
        );
        if (kept.length === 0) {
          reasons.push({ kind, classIndex, component });
          break;
        }
      }

      // Merge sections that are interchangeable for scheduling.
      const byTime = new Map<string, GeneratorSection[]>();
      for (const section of kept) {
        const key = optionKey(
          toIntervals(section.meetings),
          toDateRange(section)
        );
        byTime.set(key, [...(byTime.get(key) ?? []), section]);
      }

      const choice = choices.length;
      const ids: number[] = [];
      for (const group of byTime.values()) {
        ids.push(options.length);
        options.push({
          choice,
          section:
            group.find((section) => selected.has(String(section.sectionId))) ??
            [...group].sort(bySeatAvailability)[0],
          intervals: toIntervals(group[0].meetings),
          range: toDateRange(group[0]),
        });
      }

      choices.push({ classIndex, component, options: ids });
    }
  });

  const n = options.length;
  const clashes = new Uint8Array(n * n);
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      if (
        options[a].choice !== options[b].choice &&
        rangesOverlap(options[a].range, options[b].range) &&
        intervalsOverlap(options[a].intervals, options[b].intervals)
      )
        clashes[a * n + b] = clashes[b * n + a] = 1;

  return { choices, options, clashes, reasons };
};
