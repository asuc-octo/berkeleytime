import { CourseOverviewFragment, SectionFragment } from 'graphql/graphql';

export type SchedulerCourseType = CourseOverviewFragment;
export type SchedulerSectionType = SectionFragment & {
  courseId: string;
};

export type Schedule = {
  courses: SchedulerCourseType[];
  sections: SchedulerSectionType[];
};

export const DEFAULT_SCHEDULE: Schedule = {
  courses: [],
  sections: [],
};

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
