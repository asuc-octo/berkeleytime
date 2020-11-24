import { CourseFragment } from 'graphql/graphql';
import { hash } from 'utils/string';

/**
 * Course to a course name
 * @example
 * courseToName(course) == "COMPSCI 61B"
 */
export function courseToName(
  course: Pick<CourseFragment, 'abbreviation' | 'courseNumber'> | null | undefined
): string {
  return course ? `${course.abbreviation} ${course.courseNumber}` : '';
}

/**
 * Gets a color for a course
 * @param course Either a course object or the courseId.
 * @returns a CSS color code.
 */
export function courseToColor(
  course: Pick<CourseFragment, 'id'> | string
): string {
  const COLORS = ['#4EA6FB', '#22C379', '#ED5186', '#F9E152'];
  return COLORS[
    hash(typeof course === 'string' ? course : course.id) % COLORS.length
  ];
}
