import { Objective, countDays, createObjective } from "./objective";
import { GeneratorPreferences, SortKey } from "./preferences";
import {
  DateRange,
  Interval,
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
  /** Ids of options in other choices that overlap this one. */
  conflicts: number[];
  /** Bit d is set when the option meets on day d (0 = Monday). */
  days: number;
  /** Earliest start and latest end; Infinity and -Infinity without times. */
  start: number;
  end: number;
  /** Class minutes per week. */
  minutes: number;
  /** 1 when `section` is closed, else 0. */
  closed: number;
  /** 1 when the option has no set time, so rules cannot check it, else 0. */
  unannounced: number;
}

/** One decision: which option to use for one component of one class. */
export interface Choice {
  classIndex: number;
  component: string;
  /** Option ids, the most promising for the sort key first. */
  options: number[];
}

export interface Problem {
  choices: Choice[];
  options: Option[];
  /** Set when a rule or busy time removed every section of a component. */
  reasons: Reason[];
  objective: Objective;
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
  /** Locked by the student; reasons say so when a rule removes these. */
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
 * The checks every section must pass, in order, locked sections included.
 * The first check that removes every remaining section becomes the reason
 * shown to the student.
 */
const checks = (
  preferences: GeneratorPreferences,
  busy: Interval[]
): [
  CheckKind,
  (intervals: Interval[], section: GeneratorSection) => boolean,
][] => {
  const { earliestStart, latestEnd, avoidDays, onlyOpenSections } = preferences;

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
    ["events", (intervals) => !intervalsOverlap(intervals, busy)],
  ];
};

/**
 * Tries first the options most likely to be best on their own, so the
 * search finds a good schedule early and can skip more of the rest.
 */
const promisingFirst = (sortBy: SortKey) => (a: Option, b: Option) => {
  const own =
    sortBy === "fewest-days"
      ? countDays(a.days) - countDays(b.days)
      : sortBy === "latest-start"
        ? Math.min(b.start, 24 * 60) - Math.min(a.start, 24 * 60)
        : sortBy === "earliest-finish"
          ? Math.max(a.end, 0) - Math.max(b.end, 0)
          : 0;
  return a.unannounced - b.unannounced || own || a.closed - b.closed;
};

const optionKey = (intervals: Interval[], range: DateRange) =>
  `${range.first}:${range.last}|${intervals
    .map(({ day, start, end }) => `${day}:${start}-${end}`)
    .sort()
    .join("|")}`;

/**
 * Builds the search problem: one choice per (class, component), with
 * sections filtered by the rules and merged into options, and for each
 * option the options it overlaps.
 */
export const buildProblem = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences
): Problem => {
  const busy = toBusyIntervals(events);
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
      for (const [kind, passes] of checks(preferences, busy)) {
        kept = kept.filter((section) =>
          passes(toIntervals(section.meetings), section)
        );
        if (kept.length === 0) {
          reasons.push(
            locked
              ? { kind, classIndex, component, locked }
              : { kind, classIndex, component }
          );
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
        const section =
          group.find((section) => selected.has(String(section.sectionId))) ??
          [...group].sort(bySeatAvailability)[0];
        const intervals = toIntervals(group[0].meetings);

        ids.push(options.length);
        options.push({
          choice,
          section,
          intervals,
          range: toDateRange(group[0]),
          conflicts: [],
          days: intervals.reduce((days, { day }) => days | (1 << day), 0),
          start: Math.min(...intervals.map(({ start }) => start)),
          end: Math.max(...intervals.map(({ end }) => end)),
          minutes: intervals.reduce(
            (sum, { start, end }) => sum + end - start,
            0
          ),
          closed: isClosed(section) ? 1 : 0,
          unannounced: intervals.length === 0 ? 1 : 0,
        });
      }

      ids.sort((a, b) =>
        promisingFirst(preferences.sortBy)(options[a], options[b])
      );
      choices.push({ classIndex, component, options: ids });
    }
  });

  const n = options.length;
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      if (
        options[a].choice !== options[b].choice &&
        rangesOverlap(options[a].range, options[b].range) &&
        intervalsOverlap(options[a].intervals, options[b].intervals)
      ) {
        options[a].conflicts.push(b);
        options[b].conflicts.push(a);
      }

  return {
    choices,
    options,
    reasons,
    objective: createObjective(preferences.sortBy, choices.length),
  };
};
