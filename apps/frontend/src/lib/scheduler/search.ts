import { Problem } from "./normalize";
import { costOf, countDays } from "./objective";

/** Shared time budget for every search in one generation. */
export interface Clock {
  /** performance.now() after which every search stops. */
  deadline: number;
  /** Search nodes visited so far, across searches. */
  nodes: number;
}

export const createClock = (budgetMs: number): Clock => ({
  deadline: performance.now() + budgetMs,
  nodes: 0,
});

export interface SearchOutcome {
  /** Option id per choice (-1 outside the search), or null if none exists. */
  picked: number[] | null;
  /** The time budget ran out, so `picked` is only the best found so far. */
  stopped: boolean;
}

/** Nodes between clock reads; reading the clock costs more than a node. */
const CLOCK_INTERVAL = 256;

const ALL_DAYS = 0b1111111;

/**
 * Depth-first branch-and-bound (README.md, "Finding the best schedule").
 *
 * Finds the lowest-cost assignment of `choiceIds` that differs from every
 * schedule in `previous` in at least `minDistance` choices. Uses forward
 * checking, the fewest-options-first variable order, and a floor (a lower
 * bound on the cost of any completion) to skip partial schedules that
 * cannot beat the best one found so far. When the clock's budget runs out it
 * stops and returns the best schedule found so far.
 */
export const search = (
  problem: Problem,
  choiceIds: number[],
  previous: number[][],
  minDistance: number,
  clock: Clock
): SearchOutcome => {
  const { choices, options, objective } = problem;
  const depthLimit = choiceIds.length;

  const active = new Uint8Array(choices.length);
  for (const choice of choiceIds) active[choice] = 1;

  const picked = new Int32Array(choices.length).fill(-1);
  // removed[o] > 0 means option o clashes with an earlier pick on this path.
  const removed = new Int32Array(options.length);
  // Options removed on the current path, so each level can undo its own.
  const dropped: number[] = [];
  // First start, last end and class minutes per day; one row of 7 per
  // depth, so going back up the tree needs no undo.
  const first = new Float64Array(7 * (depthLimit + 1)).fill(Infinity);
  const last = new Float64Array(7 * (depthLimit + 1)).fill(-Infinity);
  const busy = new Float64Array(7 * (depthLimit + 1));
  // How many choices already differ from each earlier result.
  const differences = new Int32Array(previous.length);

  let best: number[] | null = null;
  let bestCost = Infinity;
  let stopped = false;

  const visit = (depth: number, closed: number, days: number): void => {
    if (
      ++clock.nodes % CLOCK_INTERVAL === 0 &&
      performance.now() > clock.deadline
    )
      stopped = true;
    if (stopped) return;

    // Every earlier result must still be reachable at the required distance.
    const remaining = depthLimit - depth;
    for (let p = 0; p < previous.length; p++)
      if (differences[p] + remaining < minDistance) return;

    const row = depth * 7;
    let span = 0;
    let minutes = 0;
    let gaps = 0;
    let firstStart = Infinity;
    let lastEnd = -Infinity;
    for (let day = 0; day < 7; day++) {
      const start = first[row + day];
      const end = last[row + day];
      if (end <= start) continue;
      span += end - start;
      minutes += busy[row + day];
      gaps += Math.max(0, end - start - busy[row + day]);
      firstStart = Math.min(firstStart, start);
      lastEnd = Math.max(lastEnd, end);
    }

    if (remaining === 0) {
      const cost = costOf(objective, {
        gapMinutes: gaps,
        daysOnCampus: countDays(days),
        closedSections: closed,
        firstStart,
        lastEnd,
      });
      if (cost < bestCost) {
        bestCost = cost;
        best = Array.from(picked);
      }
      return;
    }

    // Bounds over every open choice, whatever option it ends up with: the
    // fewest closed sections it adds, the most class minutes it can fill
    // gaps with, the latest the week can still start, the earliest it can
    // still end, and the days it meets on in any case. Branch on the choice
    // with the fewest live options.
    let next = -1;
    let fewest = Infinity;
    let closedFloor = closed;
    let minutesLeft = 0;
    let startCeiling = firstStart;
    let endFloor = lastEnd;
    let forced = days;

    for (const choice of choiceIds) {
      if (picked[choice] !== -1) continue;

      let live = 0;
      let fewestClosed = 1;
      let mostMinutes = 0;
      let latestStart = -Infinity;
      let earliestEnd = Infinity;
      let common = ALL_DAYS;

      for (const id of choices[choice].options) {
        if (removed[id] !== 0) continue;
        const option = options[id];
        live++;
        fewestClosed = Math.min(fewestClosed, option.closed);
        mostMinutes = Math.max(mostMinutes, option.minutes);
        latestStart = Math.max(latestStart, option.start);
        earliestEnd = Math.min(earliestEnd, option.end);
        common &= option.days;
      }

      if (live === 0) return;

      closedFloor += fewestClosed;
      minutesLeft += mostMinutes;
      startCeiling = Math.min(startCeiling, latestStart);
      endFloor = Math.max(endFloor, earliestEnd);
      forced |= common;

      if (live < fewest) {
        fewest = live;
        next = choice;
      }
    }

    // Time on campus only grows and the open choices add at most
    // `minutesLeft` of class time, so gaps cannot shrink below this.
    const floor = costOf(objective, {
      gapMinutes: Math.max(0, span - minutes - minutesLeft),
      daysOnCampus: countDays(forced),
      closedSections: closedFloor,
      firstStart: startCeiling,
      lastEnd: endFloor,
    });
    if (floor >= bestCost) return;

    const nextRow = row + 7;

    for (const id of choices[next].options) {
      if (removed[id] !== 0) continue;

      const option = options[id];
      picked[next] = id;
      for (let p = 0; p < previous.length; p++)
        if (previous[p][next] !== id) differences[p]++;

      // Forward checking: remove clashing options of open choices.
      const mark = dropped.length;
      for (const other of option.conflicts) {
        const owner = options[other].choice;
        if (active[owner] === 1 && picked[owner] === -1) {
          removed[other]++;
          dropped.push(other);
        }
      }

      for (let day = 0; day < 7; day++) {
        first[nextRow + day] = first[row + day];
        last[nextRow + day] = last[row + day];
        busy[nextRow + day] = busy[row + day];
      }
      for (const { day, start, end } of option.intervals) {
        if (start < first[nextRow + day]) first[nextRow + day] = start;
        if (end > last[nextRow + day]) last[nextRow + day] = end;
        busy[nextRow + day] += end - start;
      }

      visit(depth + 1, closed + option.closed, days | option.days);

      for (let i = dropped.length - 1; i >= mark; i--) removed[dropped[i]]--;
      dropped.length = mark;
      for (let p = 0; p < previous.length; p++)
        if (previous[p][next] !== id) differences[p]--;
      picked[next] = -1;

      if (stopped) return;
    }
  };

  visit(0, 0, 0);

  return { picked: best, stopped };
};
