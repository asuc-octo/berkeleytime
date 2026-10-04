import { findDiverseSchedules } from "./diversify";
import { expandSchedule } from "./expand";
import { explain } from "./explain";
import { buildProblem } from "./normalize";
import { GeneratorPreferences } from "./preferences";
import { Finish, createClock } from "./search";
import {
  GenerateOptions,
  GenerateResult,
  GeneratorClass,
  GeneratorEvent,
  Quality,
} from "./types";

export * from "./types";

/**
 * Default budgets. Realistic inputs finish exactly in well under the soft
 * budget; the gap and the hard budget only matter for unusually large
 * inputs or slow devices (README.md, "Approximation policy").
 */
export const DEFAULT_OPTIONS: Required<GenerateOptions> = {
  count: 8,
  softBudgetMs: 150,
  hardBudgetMs: 500,
  gap: 0.05,
};

const toQuality = (finish: Finish, gap: number): Quality =>
  finish === "exact"
    ? { kind: "optimal" }
    : finish === "gap"
      ? { kind: "near-optimal", gap }
      : { kind: "best-found" };

/**
 * Generates up to `count` conflict-free schedules for the given classes,
 * best first, each clearly different from the ones before it. When none
 * exists, `reasons` says why. Pure and synchronous; run it in a worker
 * through `useScheduleGenerator` to keep the page responsive.
 */
export const generateSchedules = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences,
  options: GenerateOptions = {}
): GenerateResult => {
  const started = performance.now();
  const { count, softBudgetMs, hardBudgetMs, gap } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const problem = buildProblem(classes, events, preferences);
  const clock = createClock(softBudgetMs, hardBudgetMs);
  const finish = (result: Omit<GenerateResult, "stats">): GenerateResult => ({
    ...result,
    stats: { nodes: clock.nodes, elapsedMs: performance.now() - started },
  });

  if (problem.reasons.length > 0)
    return finish({
      schedules: [],
      quality: { kind: "optimal" },
      reasons: problem.reasons,
    });

  const found = findDiverseSchedules(problem, count, clock, gap);
  const quality = toQuality(found.finish, gap);

  if (found.choices.length === 0)
    return finish({
      schedules: [],
      quality,
      // Gap pruning never hides the only schedule, so "no schedule" is exact
      // unless the hard budget stopped the search.
      reasons:
        found.finish === "stopped"
          ? []
          : explain(
              problem,
              classes.length,
              createClock(hardBudgetMs, hardBudgetMs)
            ),
    });

  return finish({
    schedules: found.choices.map((choice, index) =>
      expandSchedule(problem, classes, choice, found.costs[index])
    ),
    quality,
    reasons: [],
  });
};
