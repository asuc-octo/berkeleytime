import { Problem } from "./normalize";
import { Clock, search } from "./search";

export interface DiverseSchedules {
  /** Option id per choice, best first. */
  picks: number[][];
  /** The time budget ran out during one of the searches. */
  stopped: boolean;
}

/**
 * Builds the result list one search at a time (README.md, "Variety"):
 * first the best schedule, then repeatedly the best schedule that differs
 * from every earlier result in at least `minDistance` choices. The distance
 * starts at half of the choices that have more than one option and drops by
 * one only when no schedule that far away exists.
 */
export const findDiverseSchedules = (
  problem: Problem,
  count: number,
  clock: Clock
): DiverseSchedules => {
  const choiceIds = problem.choices.map((_, index) => index);
  const flexible = problem.choices.filter(
    (choice) => choice.options.length > 1
  ).length;

  const picks: number[][] = [];
  let minDistance = Math.max(1, Math.ceil(flexible / 2));

  while (picks.length < count && minDistance > 0) {
    const outcome = search(problem, choiceIds, picks, minDistance, clock);

    if (outcome.picked) picks.push(outcome.picked);
    if (outcome.stopped) return { picks, stopped: true };
    if (!outcome.picked) minDistance--;
  }

  return { picks, stopped: false };
};
