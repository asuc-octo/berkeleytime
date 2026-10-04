import { GeneratorPreferences } from "./preferences";
import { Interval } from "./time";
import { GeneratorSection } from "./types";

/*
 * The score of a schedule is a weighted sum; lower is better. Every term is
 * one of two kinds, which is what makes the search fast (README.md, "Why the
 * floor is valid"):
 *
 * - per-slot: depends only on one chosen time slot, so it adds up.
 * - monotone: depends on the whole schedule but can only grow as meetings
 *   are added (days used, time on campus).
 *
 * A new term must be one of these kinds. A reward such as "prefer breaks"
 * has to be written as a penalty on its opposite (long back-to-back runs).
 */

export const WEIGHTS = {
  /** Per minute a meeting falls outside the preferred hours. */
  outsideHours: 1,
  /** A closed section; one at least 90% full costs a quarter of this. */
  seatRisk: 60,
  /** Per minute between a day's first start and last end. */
  timeOnCampus: 1,
  /** Per day with a meeting. */
  dayOnCampus: 120,
  /** Per avoided day with a meeting. */
  avoidedDay: 500,
};

export const ALL_DAYS = 0b1111111;

export const popcount = (mask: number) => {
  let count = 0;
  for (let rest = mask; rest; rest &= rest - 1) count++;
  return count;
};

export const isClosed = (section: GeneratorSection) =>
  section.enrollment?.latest?.status === "C";

/** Enrolled share of capacity, or 0 when unknown. */
export const fill = (section: GeneratorSection) => {
  const latest = section.enrollment?.latest;
  return latest && latest.maxEnroll > 0
    ? latest.enrolledCount / latest.maxEnroll
    : 0;
};

/** 1 for closed, 0.25 for at least 90% full, else 0. */
export const seatRisk = (section: GeneratorSection) => {
  if (isClosed(section)) return 1;
  return fill(section) >= 0.9 ? 0.25 : 0;
};

/** Orders sections by how likely the student is to get a seat. */
export const bySeatAvailability = (a: GeneratorSection, b: GeneratorSection) =>
  seatRisk(a) - seatRisk(b) || fill(a) - fill(b);

/**
 * Per-slot cost: minutes outside the preferred hours plus seat risk. Seat
 * risk uses the best section in the slot, because that is the one chosen.
 */
export const slotCost = (
  intervals: Interval[],
  sections: GeneratorSection[],
  { earliestStart, latestEnd }: GeneratorPreferences
) => {
  let cost = WEIGHTS.seatRisk * Math.min(...sections.map(seatRisk));

  for (const { start, end } of intervals) {
    if (earliestStart !== null)
      cost += WEIGHTS.outsideHours * Math.max(0, earliestStart - start);
    if (latestEnd !== null)
      cost += WEIGHTS.outsideHours * Math.max(0, end - latestEnd);
  }

  return cost;
};

/** Monotone: avoided days used, plus days on campus when asked. */
export const dayCost = (
  dayMask: number,
  avoidMask: number,
  preferences: GeneratorPreferences
) =>
  WEIGHTS.avoidedDay * popcount(dayMask & avoidMask) +
  (preferences.fewerDays ? WEIGHTS.dayOnCampus * popcount(dayMask) : 0);

/**
 * Monotone: total time on campus (last end minus first start, per day) when
 * fewer gaps is asked. `first` and `last` hold 7 entries starting at
 * `offset`; days without meetings have first = Infinity.
 */
export const spanCost = (
  first: Float64Array,
  last: Float64Array,
  offset: number,
  preferences: GeneratorPreferences
) => {
  if (!preferences.fewerGaps) return 0;

  let total = 0;
  for (let day = 0; day < 7; day++) {
    const span = last[offset + day] - first[offset + day];
    if (span > 0) total += span;
  }

  return WEIGHTS.timeOnCampus * total;
};
