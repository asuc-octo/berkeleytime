import { Problem, isClosed } from "./normalize";
import { SortKey } from "./preferences";

/** One valid schedule plus the numbers the sort keys use. */
export interface Candidate {
  /** Option id per choice. */
  picked: number[];
  daysOnCampus: number;
  /** Idle time between the first and last class of each day, summed. */
  gapMinutes: number;
  /** Earliest start and latest end of the week; Infinity / 0 without times. */
  firstStart: number;
  lastEnd: number;
  closedSections: number;
}

/**
 * Returns a function that measures one schedule. Per-day numbers for every
 * option are prepared once here, so a measurement is one pass over 7 days
 * per picked option, with no sorting: thousands of schedules are measured
 * per search.
 *
 * Gap time is time on campus minus class time. Rounded Berkeley times make
 * back-to-back classes touch, so passing time adds nothing.
 */
export const createMeasure = (problem: Problem) => {
  const options = problem.options.map((option) => {
    const first = Array(7).fill(Infinity);
    const last = Array(7).fill(-Infinity);
    const busy = Array(7).fill(0);
    for (const { day, start, end } of option.intervals) {
      first[day] = Math.min(first[day], start);
      last[day] = Math.max(last[day], end);
      busy[day] += end - start;
    }
    return { first, last, busy, closed: isClosed(option.section) };
  });

  const first = new Float64Array(7);
  const last = new Float64Array(7);
  const busy = new Float64Array(7);

  return (picked: number[]): Candidate => {
    first.fill(Infinity);
    last.fill(-Infinity);
    busy.fill(0);
    let closedSections = 0;

    for (const id of picked) {
      if (id < 0) continue;
      const option = options[id];
      if (option.closed) closedSections++;
      for (let day = 0; day < 7; day++) {
        if (option.first[day] < first[day]) first[day] = option.first[day];
        if (option.last[day] > last[day]) last[day] = option.last[day];
        busy[day] += option.busy[day];
      }
    }

    let daysOnCampus = 0;
    let gapMinutes = 0;
    let firstStart = Infinity;
    let lastEnd = 0;
    for (let day = 0; day < 7; day++) {
      if (last[day] <= first[day]) continue;
      daysOnCampus++;
      gapMinutes += Math.max(0, last[day] - first[day] - busy[day]);
      firstStart = Math.min(firstStart, first[day]);
      lastEnd = Math.max(lastEnd, last[day]);
    }

    return {
      picked: [...picked],
      daysOnCampus,
      gapMinutes,
      firstStart,
      lastEnd,
      closedSections,
    };
  };
};

type Compare = (a: Candidate, b: Candidate) => number;

const PRIMARY: Record<SortKey, Compare> = {
  "fewest-gaps": (a, b) => a.gapMinutes - b.gapMinutes,
  "fewest-days": (a, b) => a.daysOnCampus - b.daysOnCampus,
  "latest-start": (a, b) => b.firstStart - a.firstStart,
  "earliest-finish": (a, b) => a.lastEnd - b.lastEnd,
};

/**
 * Orders by the student's choice, then fewer closed sections, then fewer
 * gaps, then fewer days.
 */
export const compareBy =
  (sortBy: SortKey): Compare =>
  (a, b) =>
    PRIMARY[sortBy](a, b) ||
    a.closedSections - b.closedSections ||
    a.gapMinutes - b.gapMinutes ||
    a.daysOnCampus - b.daysOnCampus;

const differences = (a: number[], b: number[]) =>
  a.reduce((count, id, index) => count + (id !== b[index] ? 1 : 0), 0);

/**
 * Takes the first `count` schedules in sorted order but skips near-copies:
 * schedules that differ from one already taken in fewer than `minDifference`
 * choices. Skipped ones fill any remaining places, still in order.
 */
export const pickDistinct = (
  sorted: Candidate[],
  count: number,
  minDifference: number
): Candidate[] => {
  const taken: Candidate[] = [];
  const skipped: Candidate[] = [];

  for (const candidate of sorted) {
    if (taken.length === count) break;
    const nearCopy = taken.some(
      (other) => differences(other.picked, candidate.picked) < minDifference
    );
    (nearCopy ? skipped : taken).push(candidate);
  }

  return [...taken, ...skipped].slice(0, count);
};
