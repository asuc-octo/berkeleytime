import { Problem } from "./normalize";
import { Clock, Finish, search, worseFinish } from "./search";

export interface DiverseSchedules {
  /** Slot id per variable, best first. */
  choices: number[][];
  costs: number[];
  /** The worst way any of the searches ended. */
  finish: Finish;
}

/**
 * Builds the result list one search at a time (README.md, "Diversity"):
 * first the cheapest schedule, then repeatedly the cheapest schedule that
 * differs from every earlier result in at least `minDistance` choices. The
 * distance starts at half of the choices that have more than one option and
 * drops by one only when no schedule that far away exists.
 */
export const findDiverseSchedules = (
  problem: Problem,
  count: number,
  clock: Clock,
  gap: number
): DiverseSchedules => {
  const variableIds = problem.variables.map((_, index) => index);
  const flexible = problem.variables.filter(
    (variable) => variable.slots.length > 1
  ).length;

  const choices: number[][] = [];
  const costs: number[] = [];
  let finish: Finish = "exact";
  let minDistance = Math.max(1, Math.ceil(flexible / 2));

  while (choices.length < count && minDistance > 0) {
    const outcome = search(
      problem,
      variableIds,
      choices,
      minDistance,
      clock,
      gap
    );
    finish = worseFinish(finish, outcome.finish);

    if (outcome.choice) {
      choices.push(outcome.choice);
      costs.push(outcome.cost);
      continue;
    }

    if (outcome.finish === "stopped") break;
    minDistance--;
  }

  return { choices, costs, finish };
};
