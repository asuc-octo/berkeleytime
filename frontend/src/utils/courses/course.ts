import { CourseFragment } from 'graphql/graphql';
import { hash } from 'utils/string';

/**
 * Course to a course name
 * @example
 * courseToName(course) == "COMPSCI 61B"
 */
export function courseToName(
  course: Pick<CourseFragment, 'abbreviation' | 'courseNumber'>
): string {
  return `${course.abbreviation} ${course.courseNumber}`;
}

/**
 * Gets a color for a course
 * @returns a CSS color code.
 */
export function courseToColor(course: Pick<CourseFragment, 'id'>): string {
  const COLORS = ['#4EA6FB', '#6AE086', '#ED5186', '#F9E152'];
  return COLORS[hash(course.id) % COLORS.length];
}
