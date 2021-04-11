import { Dispatch, SetStateAction } from 'react';
import { CourseOverviewFragment } from '../../../graphql/graphql';
import { Schedule, SchedulerCourseType } from 'utils/scheduler/scheduler';

/**
 * Adds a course to schedule
 */
export function addCourse(course: SchedulerCourseType, schedule: Schedule, setSchedule: Dispatch<SetStateAction<Schedule>>) {
  if (schedule.courses.filter((e: CourseOverviewFragment) => e.id === course.id).length === 0) {
    setSchedule({
      ...schedule,
      courses: [course, ...schedule.courses],
    });
  }
}
