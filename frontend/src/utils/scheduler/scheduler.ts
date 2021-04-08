import {
  CourseOverviewFragment,
  SectionFragment,
  SectionSelectionInput,
} from '../../graphql/graphql';
import { addUnits, parseUnits, Units, ZERO_UNITS } from 'utils/courses/units';

export type SchedulerCourseType = CourseOverviewFragment;
export type SchedulerSectionType = SectionFragment & {
  /**
   * The ID of the parent course of this seciton
   */
  courseId: string;

  /**
   * If this is a secondary section, the ID of
   * the primary section. If this is undefined,
   * it is a primary section.
   */
  lectureId?: string;
};

export type Schedule = {
  name: string;
  courses: SchedulerCourseType[];
  sections: SchedulerSectionType[];
};

export const createSchedule = (name: string = 'My Schedule'): Schedule => ({
  name: name,
  courses: [],
  sections: [],
});

/**
 * Gets a corresponding course for a section (assuming it exists in the
 * schedule)
 */
export const getCourseForSchedule = (
  schedule: Schedule,
  section: SchedulerSectionType
): SchedulerCourseType | null =>
  schedule.courses.find((c) => c.id === section.courseId) || null;

/**
 * Computes the amount of units in a schedule
 */
export const getUnitsForSchedule = (schedule: Schedule): Units =>
  schedule.courses.reduce(
    (sum, course) =>
      course.units ? addUnits(sum, parseUnits(course.units)) : sum,
    ZERO_UNITS
  );

/**
 * Removes a course by id
 */
export const removeCourse = (schedule: Schedule, id: string): Schedule => ({
  ...schedule,
  courses: schedule.courses.filter((c) => c.id !== id),
  sections: schedule.sections.filter((s) => s.courseId !== id),
});

/**
 * Checks if the scheduler has a course by Id
 */
export const hasCourseById = (schedule: Schedule, id: string): boolean =>
  !!schedule.courses.find((c) => c.id === id);

/**
 * Checks if the scheduler has a section by Id
 */
export const hasSectionById = (schedule: Schedule, id: string): boolean =>
  !!schedule.sections.find((c) => c.id === id);

/**
 * Converts a schedule from the frontend to backend format
 */
export const serializeSchedule = (
  schedule: Schedule
): SectionSelectionInput[] =>
  schedule.courses
    .map((course) => ({
      course: course.id,
      primary: schedule.sections.find(
        (section) => section.courseId === course.id && !section.lectureId
      )?.id,
      secondary: schedule.sections
        .filter(
          (section) => section.courseId === course.id && !!section.lectureId
        )
        .map((section) => section.id),
    }))
    .filter((input) => !!input.primary);
