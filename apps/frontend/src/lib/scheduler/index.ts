import { enumerateSchedules } from "./enumerate";
import { explain } from "./explain";
import { Problem, buildProblem } from "./normalize";
import { DEFAULT_PREFERENCES, GeneratorPreferences } from "./preferences";
import { Candidate, compareBy, createMeasure, pickDistinct } from "./rank";
import {
  GenerateOptions,
  GenerateResult,
  GeneratedSchedule,
  GeneratorClass,
  GeneratorEvent,
  Relaxation,
  Rule,
} from "./types";

export * from "./types";

export const DEFAULT_OPTIONS: Required<GenerateOptions> = {
  count: 8,
  cap: 20_000,
};

/** Relaxation hints count schedules only this far; the UI shows "1,000+". */
export const RELAXATION_CAP = 1_000;

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

/** For each rule in use: how many schedules fit if only that rule is off. */
const findRelaxations = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences
): Relaxation[] =>
  RULES.filter((rule) => isActive(rule, preferences)).flatMap((rule) => {
    const problem = buildProblem(classes, events, turnOff(rule, preferences));
    if (problem.reasons.length > 0) return [];

    const { count } = enumerateSchedules(
      problem,
      allChoices(problem),
      RELAXATION_CAP,
      () => {}
    );
    return count > 0 ? [{ rule, count }] : [];
  });

const toSchedule = (
  problem: Problem,
  classCount: number,
  candidate: Candidate
): GeneratedSchedule => {
  const sectionIds = Array.from({ length: classCount }, (): string[] => []);
  candidate.picked.forEach((id, choice) => {
    if (id >= 0)
      sectionIds[problem.choices[choice].classIndex].push(
        problem.options[id].section.sectionId
      );
  });

  return {
    classes: sectionIds.map((ids, classIndex) => ({
      classIndex,
      sectionIds: ids,
    })),
    daysOnCampus: candidate.daysOnCampus,
    gapMinutes: candidate.gapMinutes,
    firstStart: Number.isFinite(candidate.firstStart)
      ? candidate.firstStart
      : null,
    lastEnd: candidate.lastEnd > 0 ? candidate.lastEnd : null,
    closedSections: candidate.closedSections,
  };
};

/**
 * Lists the conflict-free schedules that pass the student's rules, sorts
 * them by the chosen key, and returns the first `count`, skipping
 * near-copies. When none exist, says why and which rule to turn off.
 */
export const generateSchedules = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences,
  options: GenerateOptions = {}
): GenerateResult => {
  const started = performance.now();
  const { count, cap } = { ...DEFAULT_OPTIONS, ...options };
  const problem = buildProblem(classes, events, preferences);

  const measure = createMeasure(problem);
  const candidates: Candidate[] = [];
  const { count: total, truncated } =
    problem.reasons.length > 0
      ? { count: 0, truncated: false }
      : enumerateSchedules(problem, allChoices(problem), cap, (picked) =>
          candidates.push(measure(picked))
        );

  if (total === 0)
    return {
      schedules: [],
      total,
      truncated,
      reasons:
        problem.reasons.length > 0
          ? problem.reasons
          : explain(problem, classes.length),
      relaxations: findRelaxations(classes, events, preferences),
      elapsedMs: performance.now() - started,
    };

  // Skipping near-copies only makes sense with two or more real choices.
  const flexible = problem.choices.filter(
    (choice) => choice.options.length > 1
  ).length;
  candidates.sort(compareBy(preferences.sortBy));

  return {
    schedules: pickDistinct(candidates, count, flexible >= 2 ? 2 : 1).map(
      (candidate) => toSchedule(problem, classes.length, candidate)
    ),
    total,
    truncated,
    reasons: [],
    relaxations: [],
    elapsedMs: performance.now() - started,
  };
};
