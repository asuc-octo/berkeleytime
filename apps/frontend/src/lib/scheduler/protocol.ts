import { generateSchedules } from "./index";
import { GeneratorPreferences } from "./preferences";
import {
  GenerateOptions,
  GenerateResult,
  GeneratorClass,
  GeneratorEvent,
  GeneratorSection,
} from "./types";

/** Message the page sends to the worker. */
export interface GenerateRequest {
  /** Increases with every request; stale responses are ignored. */
  id: number;
  classes: GeneratorClass[];
  events: GeneratorEvent[];
  preferences: GeneratorPreferences;
  options?: GenerateOptions;
}

/** Message the worker sends back. */
export type GenerateResponse =
  | { id: number; result: GenerateResult }
  | { id: number; error: string };

const toSection = ({
  sectionId,
  component,
  startDate,
  endDate,
  meetings,
  enrollment,
}: GeneratorSection): GeneratorSection => ({
  sectionId,
  component,
  startDate,
  endDate,
  meetings: meetings.map(({ days, startTime, endTime }) => ({
    days,
    startTime,
    endTime,
  })),
  enrollment: enrollment?.latest
    ? {
        latest: {
          status: enrollment.latest.status,
          enrolledCount: enrollment.latest.enrolledCount,
          maxEnroll: enrollment.latest.maxEnroll,
        },
      }
    : null,
});

/**
 * Keeps only the fields the solver reads, so far less data is copied into
 * the worker (schedule classes also carry grades, exams and instructors).
 */
export const toGeneratorClasses = (
  classes: GeneratorClass[]
): GeneratorClass[] =>
  classes.map((scheduleClass) => ({
    class: {
      primarySection: scheduleClass.class.primarySection
        ? toSection(scheduleClass.class.primarySection)
        : null,
      sections: scheduleClass.class.sections.map(toSection),
    },
    selectedSections: scheduleClass.selectedSections.map(({ sectionId }) => ({
      sectionId,
    })),
    locked: scheduleClass.locked,
    blockedSections: scheduleClass.blockedSections,
    lockedComponents: scheduleClass.lockedComponents,
  }));

export const toGeneratorEvents = (events: GeneratorEvent[]) =>
  events.map(({ days, startTime, endTime }) => ({ days, startTime, endTime }));

/** Runs one request. Shared by the worker and the main-thread fallback. */
export const handleRequest = (request: GenerateRequest): GenerateResponse => {
  try {
    return {
      id: request.id,
      result: generateSchedules(
        request.classes,
        request.events,
        request.preferences,
        request.options
      ),
    };
  } catch (error) {
    return {
      id: request.id,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
