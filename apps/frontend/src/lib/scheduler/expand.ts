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
 * Turns a slot choice into real sections (README.md, "Expand").
 *
 * In each slot it keeps the section the student already has, if any, else
 * the one most likely to have a seat. Backups for a section are the other
 * sections in its slot, then sections in other slots of the same component
 * that overlap nothing else in the schedule.
 */
export const expandSchedule = (
  problem: Problem,
  classes: GeneratorClass[],
  choice: number[],
  cost: number
): GeneratedSchedule => {
  const { variables, slots, conflictMatrix } = problem;
  const n = slots.length;
  const byClass = classes.map(
    (_, classIndex): GeneratedClassChoice => ({ classIndex, sections: [] })
  );
  const intervals: Interval[] = [];
  let closedSections = 0;

  // A slot of this variable fits if it overlaps no other chosen slot.
  const fits = (candidate: number, variableIndex: number) =>
    choice.every(
      (picked, other) =>
        other === variableIndex ||
        picked < 0 ||
        conflictMatrix[candidate * n + picked] === 0
    );

  choice.forEach((id, variableIndex) => {
    if (id < 0) return;

    const slot = slots[id];
    const variable = variables[variableIndex];
    const selected = new Set(
      classes[variable.classIndex].selectedSections.map(({ sectionId }) =>
        String(sectionId)
      )
    );

    const ranked = [...slot.sections].sort(bySeatAvailability);
    const section =
      slot.sections.find((candidate) =>
        selected.has(String(candidate.sectionId))
      ) ?? ranked[0];

    const otherTimes = variable.slots
      .filter((other) => other !== id && fits(other, variableIndex))
      .flatMap((other) => [...slots[other].sections].sort(bySeatAvailability));

    byClass[variable.classIndex].sections.push({
      sectionId: section.sectionId,
      backups: [
        ...ranked.filter((candidate) => candidate !== section),
        ...otherTimes,
      ].map((candidate) => candidate.sectionId),
    });

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
