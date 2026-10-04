import { Problem } from "./normalize";
import { Clock, search } from "./search";
import { Reason } from "./types";

/**
 * Finds why no schedule exists (README.md, "Explain"). Tests each class on
 * its own, then each pair of classes, and reports the smallest groups that
 * cannot fit. With 3-6 classes that is at most 21 small searches, so plain
 * enumeration replaces conflict-search algorithms such as QuickXplain.
 */
export const explain = (
  problem: Problem,
  classCount: number,
  clock: Clock
): Reason[] => {
  const byClass = Array.from({ length: classCount }, (_, classIndex) =>
    problem.variables.flatMap((variable, index) =>
      variable.classIndex === classIndex ? [index] : []
    )
  );

  // A search cut short by the budget counts as fitting, so a conflict is
  // only reported when it is proven.
  const fits = (variableIds: number[]) => {
    const outcome = search(problem, variableIds, [], 0, clock);
    return outcome.choice !== null || outcome.stopped;
  };

  const reasons: Reason[] = [];

  byClass.forEach((ids, classIndex) => {
    if (ids.length > 0 && !fits(ids))
      reasons.push({ kind: "class", classIndex });
  });
  if (reasons.length > 0) return reasons;

  for (let a = 0; a < classCount; a++)
    for (let b = a + 1; b < classCount; b++)
      if (!fits([...byClass[a], ...byClass[b]]))
        reasons.push({ kind: "pair", classIndexes: [a, b] });

  return reasons.length > 0 ? reasons : [{ kind: "all" }];
};
