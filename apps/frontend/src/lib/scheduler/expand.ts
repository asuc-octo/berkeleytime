import { Problem } from "./normalize";
import { bySeatAvailability, isClosed } from "./objective";
import { Interval } from "./time";
import {
  GeneratedClassChoice,
  GeneratedSchedule,
  GeneratorClass,
} from "./types";

/** Breaks this short are passing time between classes, not gaps. */
const PASSING_MINUTES = 10;

/** Minutes between classes on the same day, ignoring passing time. */
export const gapMinutes = (intervals: Interval[]) => {
  let total = 0;

  for (let day = 0; day < 7; day++) {
    const today = intervals
      .filter((interval) => interval.day === day)
      .sort((a, b) => a.start - b.start);

    let latest = -Infinity;
    for (const { start, end } of today) {
      if (latest > -Infinity && start - latest > PASSING_MINUTES)
        total += start - latest;
      latest = Math.max(latest, end);
    }
  }

  return total;
};

/**
 * Turns a slot choice into real sections (README.md, "Expand"). In each slot
 * it keeps the section the student already has, if any, else the one most
 * likely to have a seat.
 */
export const expandSchedule = (
  problem: Problem,
  classes: GeneratorClass[],
  choice: number[],
  cost: number
): GeneratedSchedule => {
  const { variables, slots } = problem;
  const byClass = classes.map(
    (_, classIndex): GeneratedClassChoice => ({ classIndex, sections: [] })
  );
  const intervals: Interval[] = [];
  let closedSections = 0;

  choice.forEach((id, variableIndex) => {
    if (id < 0) return;

    const slot = slots[id];
    const { classIndex } = variables[variableIndex];
    const selected = new Set(
      classes[classIndex].selectedSections.map(({ sectionId }) =>
        String(sectionId)
      )
    );

    const section =
      slot.sections.find((candidate) =>
        selected.has(String(candidate.sectionId))
      ) ?? [...slot.sections].sort(bySeatAvailability)[0];

    byClass[classIndex].sections.push({ sectionId: section.sectionId });

    if (isClosed(section)) closedSections++;
    intervals.push(...slot.intervals);
  });

  return {
    classes: byClass,
    cost,
    daysOnCampus: new Set(intervals.map(({ day }) => day)).size,
    gapMinutes: gapMinutes(intervals),
    closedSections,
  };
};
