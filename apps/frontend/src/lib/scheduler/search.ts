import { Problem } from "./normalize";
import { ALL_DAYS, dayCost, spanCost } from "./objective";

/** Shared time budget for every search in one generation. */
export interface Clock {
  /** performance.now() after which searches prune with the gap. */
  soft: number;
  /** performance.now() after which every search stops. */
  hard: number;
  /** Search nodes visited so far, across searches. */
  nodes: number;
}

export const createClock = (
  softBudgetMs: number,
  hardBudgetMs: number
): Clock => {
  const now = performance.now();
  return { soft: now + softBudgetMs, hard: now + hardBudgetMs, nodes: 0 };
};

/**
 * How a search ended.
 * - exact: finished with exact pruning.
 * - gap: finished, but pruned with the gap after the soft budget.
 * - stopped: the hard budget ran out.
 */
export type Finish = "exact" | "gap" | "stopped";

const FINISH_ORDER: Finish[] = ["exact", "gap", "stopped"];

export const worseFinish = (a: Finish, b: Finish): Finish =>
  FINISH_ORDER.indexOf(a) >= FINISH_ORDER.indexOf(b) ? a : b;

export interface SearchOutcome {
  /** Slot id per variable (-1 outside the search), or null if none exists. */
  choice: number[] | null;
  cost: number;
  finish: Finish;
}

/** Nodes between clock reads; reading the clock costs more than a node. */
const CLOCK_INTERVAL = 256;

/**
 * Depth-first branch-and-bound (README.md, "Search").
 *
 * Finds the cheapest assignment of `variableIds` that differs from every
 * schedule in `previous` in at least `minDistance` variables. Uses forward
 * checking, the fewest-options-first (MRV) variable order, and a floor
 * (lower bound) built from per-slot and monotone costs. After the clock's
 * soft budget it prunes with a relative `gap`; at the hard budget it stops
 * and returns the best schedule found so far.
 */
export const search = (
  problem: Problem,
  variableIds: number[],
  previous: number[][],
  minDistance: number,
  clock: Clock,
  gap: number
): SearchOutcome => {
  const { variables, slots, avoidMask, preferences } = problem;
  const depthLimit = variableIds.length;

  const active = new Uint8Array(variables.length);
  for (const variable of variableIds) active[variable] = 1;

  const choice = new Int32Array(variables.length).fill(-1);
  // removed[s] > 0 means slot s clashes with an earlier choice on this path.
  const removed = new Int32Array(slots.length);
  // Slots removed on the current path, so each level can undo its own.
  const dropped: number[] = [];
  // First start and last end per day; one row of 7 per depth, so going back
  // up the tree needs no undo.
  const first = new Float64Array(7 * (depthLimit + 1)).fill(Infinity);
  const last = new Float64Array(7 * (depthLimit + 1)).fill(-Infinity);
  // How many variables already differ from each earlier result.
  const differences = new Int32Array(previous.length);

  let best: number[] | null = null;
  let bestCost = Infinity;
  let tolerance = performance.now() > clock.soft ? gap : 0;
  let usedGap = tolerance > 0;
  let stopped = false;

  const visit = (depth: number, cost: number, dayMask: number): void => {
    if (++clock.nodes % CLOCK_INTERVAL === 0) {
      const now = performance.now();
      if (now > clock.hard) stopped = true;
      else if (tolerance === 0 && now > clock.soft) {
        tolerance = gap;
        usedGap = true;
      }
    }
    if (stopped) return;

    // Every earlier result must still be reachable at the required distance.
    const remaining = depthLimit - depth;
    for (let p = 0; p < previous.length; p++)
      if (differences[p] + remaining < minDistance) return;

    const row = depth * 7;
    const partial =
      cost +
      dayCost(dayMask, avoidMask, preferences) +
      spanCost(first, last, row, preferences);

    if (remaining === 0) {
      if (partial < bestCost) {
        bestCost = partial;
        best = Array.from(choice);
      }
      return;
    }

    // Floor for any completion: the cheapest live slot of every open
    // variable, plus the days some variable uses whichever slot it gets.
    // Branch on the variable with the fewest live slots (MRV).
    let floor = partial;
    let forced = dayMask;
    let next = -1;
    let fewest = Infinity;

    for (const variable of variableIds) {
      if (choice[variable] !== -1) continue;

      const ids = variables[variable].slots;
      let live = 0;
      let cheapest = 0;
      let common = ALL_DAYS;

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (removed[id] !== 0) continue;
        // Slots are sorted by cost, so the first live one is the cheapest.
        if (live === 0) cheapest = slots[id].cost;
        live++;
        common &= slots[id].dayMask;
      }

      if (live === 0) return;

      floor += cheapest;
      forced |= common;

      if (live < fewest) {
        fewest = live;
        next = variable;
      }
    }

    floor +=
      dayCost(forced, avoidMask, preferences) -
      dayCost(dayMask, avoidMask, preferences);

    // Exact pruning while tolerance is 0. With a gap, anything pruned costs
    // at least bestCost / (1 + gap), so the result stays within that factor.
    if (floor * (1 + tolerance) >= bestCost) return;

    const nextRow = row + 7;

    for (const id of variables[next].slots) {
      if (removed[id] !== 0) continue;

      const slot = slots[id];
      choice[next] = id;
      for (let p = 0; p < previous.length; p++)
        if (previous[p][next] !== id) differences[p]++;

      // Forward checking: remove clashing slots of open variables.
      const mark = dropped.length;
      for (const other of slot.conflicts) {
        const owner = slots[other].variable;
        if (active[owner] === 1 && choice[owner] === -1) {
          removed[other]++;
          dropped.push(other);
        }
      }

      for (let day = 0; day < 7; day++) {
        first[nextRow + day] = first[row + day];
        last[nextRow + day] = last[row + day];
      }
      for (const { day, start, end } of slot.intervals) {
        if (start < first[nextRow + day]) first[nextRow + day] = start;
        if (end > last[nextRow + day]) last[nextRow + day] = end;
      }

      visit(depth + 1, cost + slot.cost, dayMask | slot.dayMask);

      for (let i = dropped.length - 1; i >= mark; i--) removed[dropped[i]]--;
      dropped.length = mark;
      for (let p = 0; p < previous.length; p++)
        if (previous[p][next] !== id) differences[p]--;
      choice[next] = -1;

      if (stopped) return;
    }
  };

  visit(0, 0, 0);

  return {
    choice: best,
    cost: bestCost,
    finish: stopped ? "stopped" : usedGap ? "gap" : "exact",
  };
};
