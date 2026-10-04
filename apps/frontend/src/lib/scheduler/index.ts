import { findDiverseSchedules } from "./diversify";
import { expandSchedule } from "./expand";
import { explain } from "./explain";
import { buildProblem } from "./normalize";
import { GeneratorPreferences } from "./preferences";
import { createClock } from "./search";
import {
  GenerateOptions,
  GenerateResult,
  GeneratorClass,
  GeneratorEvent,
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

/**
 * Generates up to `count` conflict-free schedules for the given classes,
 * best first, each clearly different from the ones before it. When none
 * exists, `reasons` says why. Pure and synchronous.
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
  const finish = (result: Omit<GenerateResult, "stats">): GenerateResult => ({
    ...result,
    stats: { nodes: clock.nodes, elapsedMs: performance.now() - started },
  });

  if (problem.reasons.length > 0)
    return finish({
      schedules: [],
      stoppedEarly: false,
      reasons: problem.reasons,
    });

  const found = findDiverseSchedules(problem, count, clock);

  return finish({
    schedules: found.choices.map((choice, index) =>
      expandSchedule(problem, classes, choice, found.costs[index])
    ),
    stoppedEarly: found.stopped,
    // "No schedule" is only proven when the search finished.
    reasons:
      found.choices.length === 0 && !found.stopped
        ? explain(problem, classes.length, createClock(budgetMs))
        : [],
  });
};
