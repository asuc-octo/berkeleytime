import {
  ClassFinalExam,
  ClassGradingBasis,
  IClassItem,
  ISectionItem,
} from "@repo/common";

import { EnrollmentModule } from "../enrollment/generated-types/module-types";
import { ClassModule } from "./generated-types/module-types";

interface ClassRelationships {
  term: null;
  course: null;
  primarySection: null;
  sections: null;
  gradeDistribution: null;
  aggregatedRatings: null;
}

export type IntermediateClass = Omit<
  ClassModule.Class,
  keyof ClassRelationships
> &
  ClassRelationships;

export const formatDate = (date?: string | number | Date | null) => {
  if (!date) return date;

  if (date instanceof Date) return date.toISOString();

  return new Date(date).toISOString();
};

export const formatClass = (_class: IClassItem) => {
  const output = {
    ..._class,

    unitsMax: _class.allowedUnits?.maximum || 0,
    unitsMin: _class.allowedUnits?.minimum || 0,

    term: null,
    course: null,
    primarySection: null,
    sections: null,
    gradeDistribution: null,
    aggregatedRatings: null,

    gradingBasis: _class.gradingBasis as ClassGradingBasis,
    finalExam: _class.finalExam as ClassFinalExam,
  };
  return output as unknown as IntermediateClass;
};

interface SectionRelationships {
  course: string;

  term: null;
  class: null;
  enrollment: null;
}

export type IntermediateSection = Omit<
  ClassModule.Section,
  keyof SectionRelationships
> &
  SectionRelationships;

/**
 * Raw instructor data from database, including the role field.
 * The role field is not exposed in GraphQL but used for filtering.
 */
interface RawInstructor {
  printInScheduleOfClasses?: boolean;
  familyName?: string | null;
  givenName?: string | null;
  role?: string | null;
}

/**
 * Filters instructors to only show Primary Instructors (PI = professors)
 * and sorts them alphabetically by last name for consistent ordering.
 * This ensures TAs don't appear in instructor lists across the application.
 *
 * This is the single source of truth for instructor filtering logic.
 */
export const filterAndSortInstructors = (
  instructors: RawInstructor[] | undefined
): ClassModule.Instructor[] => {
  if (!instructors) return [];

  const normalize = (
    list: RawInstructor[],
    requireRole: boolean
  ): ClassModule.Instructor[] =>
    list
      .filter(
        (
          instructor
        ): instructor is RawInstructor & {
          familyName: string;
          givenName: string;
        } =>
          (!requireRole || instructor.role === "PI") &&
          typeof instructor.familyName === "string" &&
          typeof instructor.givenName === "string"
      )
      .map((instructor) => ({
        familyName: instructor.familyName,
        givenName: instructor.givenName,
      }))
      .sort((a, b) => a.familyName.localeCompare(b.familyName));

  // Prefer PIs; if none present (data gaps), fall back to any instructors with names.
  const primaryInstructors = normalize(instructors, true);
  if (primaryInstructors.length > 0) return primaryInstructors;

  return normalize(instructors, false);
};

export const formatSection = (
  section: ISectionItem,
  enrollment: EnrollmentModule.Enrollment | null | undefined = null
) => {
  const output = {
    ...section,

    online: section.instructionMode === "O",
    course: section.courseId,
    attendanceRequired: false, // Default value
    lecturesRecorded: false, // Default value

    term: null,
    class: null,
    enrollment: enrollment ?? null,

    // Filter meetings to only show professors (PI), not TAs
    meetings: section.meetings?.map((meeting) => ({
      ...meeting,
      instructors: filterAndSortInstructors(meeting.instructors),
    })),
  } as IntermediateSection;

  return output;
};
