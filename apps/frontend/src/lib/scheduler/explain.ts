import { enumerateSchedules } from "./enumerate";
import { Problem } from "./normalize";
import { Reason } from "./types";

/**
 * Finds why no schedule exists (README.md, "Explaining nothing fits"). Tests
 * each class on its own, then each pair of classes, and reports the
 * smallest groups that cannot fit. Six classes make 21 such groups, each a
 * small search, so plain enumeration replaces conflict-search algorithms
 * such as QuickXplain.
 */
export const explain = (problem: Problem, classCount: number): Reason[] => {
  const byClass = Array.from({ length: classCount }, (_, classIndex) =>
    problem.choices.flatMap((choice, index) =>
      choice.classIndex === classIndex ? [index] : []
    )
  );

  // A search that hit the step limit proves nothing, so it does not blame.
  const fits = (choiceIds: number[]) => {
    const { count, truncated } = enumerateSchedules(
      problem,
      choiceIds,
      1,
      () => {}
    );
    return count > 0 || truncated;
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
