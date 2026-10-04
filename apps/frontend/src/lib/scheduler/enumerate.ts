import { Problem } from "./normalize";

/**
 * The most options the search tries in one run. The cap limits schedules
 * found, but when few or none exist the search can still try millions of
 * options that lead nowhere; this bounds that work (about 13 ms in the test
 * where nothing fits). Normal inputs use under 100,000.
 */
export const STEP_LIMIT = 1_000_000;

/**
 * Lists every combination of one option per choice in which no two options
 * overlap, calling `onSchedule` for each. Stops after `cap` schedules or
 * `STEP_LIMIT` tries and then reports `truncated` (README.md, "Listing
 * schedules").
 *
 * Plain backtracking: fill one choice at a time and back up as soon as the
 * new option overlaps one already picked. Choices with the fewest options go
 * first, so dead ends show up near the top of the search instead of deep in
 * it.
 *
 * `onSchedule` receives the option picked for each choice (-1 for choices
 * outside `choiceIds`). The array is reused, so copy what you keep.
 */
export const enumerateSchedules = (
  problem: Problem,
  choiceIds: number[],
  cap: number,
  onSchedule: (picked: number[]) => void
): { count: number; truncated: boolean } => {
  const { choices, clashes } = problem;
  const n = problem.options.length;
  const order = [...choiceIds].sort(
    (a, b) => choices[a].options.length - choices[b].options.length
  );

  const picked: number[] = choices.map(() => -1);
  const path: number[] = [];
  let count = 0;
  let steps = 0;

  // Returns false once a limit is reached, to unwind the whole search.
  const visit = (depth: number): boolean => {
    if (depth === order.length) {
      count++;
      onSchedule(picked);
      return count < cap;
    }

    const choice = order[depth];
    for (const option of choices[choice].options) {
      if (++steps > STEP_LIMIT) return false;

      const row = option * n;
      let clash = false;
      for (let i = 0; i < path.length && !clash; i++)
        clash = clashes[row + path[i]] === 1;
      if (clash) continue;

      picked[choice] = option;
      path.push(option);
      const keepGoing = visit(depth + 1);
      path.pop();
      picked[choice] = -1;

      if (!keepGoing) return false;
    }

    return true;
  };

  const finished = visit(0);

  return { count, truncated: !finished };
};
