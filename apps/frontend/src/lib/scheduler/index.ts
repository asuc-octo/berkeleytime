import { findDiverseSchedules } from "./diversify";
import { explain } from "./explain";
import { Problem, buildProblem } from "./normalize";
import { Totals } from "./objective";
import { DEFAULT_PREFERENCES, GeneratorPreferences } from "./preferences";
import { Clock, createClock, search } from "./search";
import {
  GenerateOptions,
  GenerateResult,
  GeneratedSchedule,
  GeneratorClass,
  GeneratorEvent,
  Rule,
} from "./types";

export * from "./types";

/**
 * Realistic inputs finish in a few milliseconds. The budget only matters for
 * unusually large inputs or slow devices, and it is short because the search
 * runs on the main thread.
 */
export const DEFAULT_OPTIONS: Required<GenerateOptions> = {
  count: 8,
  budgetMs: 100,
};

const RULES: Rule[] = [
  "earliestStart",
  "latestEnd",
  "avoidDays",
  "onlyOpenSections",
];

const isActive = (rule: Rule, preferences: GeneratorPreferences) =>
  rule === "avoidDays"
    ? preferences.avoidDays.some(Boolean)
    : rule === "onlyOpenSections"
      ? preferences.onlyOpenSections
      : preferences[rule] !== null;

/** The preferences with one rule set back to its default (off). */
export const turnOff = (
  rule: Rule,
  preferences: GeneratorPreferences
): GeneratorPreferences => ({
  ...preferences,
  [rule]: DEFAULT_PREFERENCES[rule],
});

const allChoices = (problem: Problem) =>
  problem.choices.map((_, index) => index);

/** Rules in use that, turned off alone, let a schedule fit. */
const findRelaxations = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences,
  clock: Clock
): Rule[] =>
  RULES.filter((rule) => {
    if (!isActive(rule, preferences)) return false;

    const problem = buildProblem(classes, events, turnOff(rule, preferences));
    return (
      problem.reasons.length === 0 &&
      search(problem, allChoices(problem), [], 0, clock).picked !== null
    );
  });

/** Days, gaps, first start, last end and closed sections of a schedule. */
export const totalsOf = (problem: Problem, picked: number[]): Totals => {
  const first = Array(7).fill(Infinity);
  const last = Array(7).fill(-Infinity);
  const busy = Array(7).fill(0);
  let closedSections = 0;

  for (const id of picked) {
    if (id < 0) continue;
    const option = problem.options[id];
    closedSections += option.closed;
    for (const { day, start, end } of option.intervals) {
      first[day] = Math.min(first[day], start);
      last[day] = Math.max(last[day], end);
      busy[day] += end - start;
    }
  }

  const totals: Totals = {
    gapMinutes: 0,
    daysOnCampus: 0,
    closedSections,
    firstStart: Infinity,
    lastEnd: -Infinity,
  };
  for (let day = 0; day < 7; day++) {
    if (last[day] <= first[day]) continue;
    totals.daysOnCampus++;
    totals.gapMinutes += Math.max(0, last[day] - first[day] - busy[day]);
    totals.firstStart = Math.min(totals.firstStart, first[day]);
    totals.lastEnd = Math.max(totals.lastEnd, last[day]);
  }

  return totals;
};

const toSchedule = (
  problem: Problem,
  classCount: number,
  picked: number[]
): GeneratedSchedule => {
  const sectionIds = Array.from({ length: classCount }, (): string[] => []);
  picked.forEach((id, choice) => {
    if (id >= 0)
      sectionIds[problem.choices[choice].classIndex].push(
        problem.options[id].section.sectionId
      );
  });
  const totals = totalsOf(problem, picked);

  return {
    classes: sectionIds.map((ids, classIndex) => ({
      classIndex,
      sectionIds: ids,
    })),
    daysOnCampus: totals.daysOnCampus,
    gapMinutes: totals.gapMinutes,
    firstStart: Number.isFinite(totals.firstStart) ? totals.firstStart : null,
    lastEnd: Number.isFinite(totals.lastEnd) ? totals.lastEnd : null,
    closedSections: totals.closedSections,
  };
};

/**
 * Finds the best schedules for the student's sort key among those that
 * follow every rule, each clearly different from the ones before it. When
 * none exists, says why and which rule to turn off. Pure and synchronous.
 */
export const generateSchedules = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences,
  options: GenerateOptions = {}
): GenerateResult => {
  const started = performance.now();
  const { count, budgetMs } = { ...DEFAULT_OPTIONS, ...options };
  const problem = buildProblem(classes, events, preferences);
  const clock = createClock(budgetMs);
  const finish = (
    result: Omit<GenerateResult, "stats">,
    clocks: Clock[]
  ): GenerateResult => ({
    ...result,
    stats: {
      nodes: clocks.reduce((sum, { nodes }) => sum + nodes, 0),
      elapsedMs: performance.now() - started,
    },
  });

  const found =
    problem.reasons.length > 0
      ? { picks: [], stopped: false }
      : findDiverseSchedules(problem, count, clock);

  // "Nothing fits" is only proven when the search finished.
  if (found.picks.length > 0 || found.stopped)
    return finish(
      {
        schedules: found.picks.map((picked) =>
          toSchedule(problem, classes.length, picked)
        ),
        stoppedEarly: found.stopped,
        reasons: [],
        relaxations: [],
      },
      [clock]
    );

  // Explaining gets its own budget, so a slow search still gets a reason.
  const explainClock = createClock(budgetMs);
  return finish(
    {
      schedules: [],
      stoppedEarly: false,
      reasons:
        problem.reasons.length > 0
          ? problem.reasons
          : explain(problem, classes.length, explainClock),
      relaxations: findRelaxations(classes, events, preferences, explainClock),
    },
    [clock, explainClock]
  );
};
