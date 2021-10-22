import { CourseOverviewFragment } from 'graphql/graphql';

export type CourseSortAttribute =
  | 'relevance'
  | 'average_grade'
  | 'department_name'
  | 'open_seats'
  | 'enrolled_percentage';

export type SortableCourse = CourseOverviewFragment;
type CourseComparator = (
  courseA: SortableCourse,
  courseB: SortableCourse
) => number;

/**
 * Comparator for department name. Essentially alphabetical order.
 */
export const compareDepartmentName: CourseComparator = (courseA, courseB) => {
  let courseATitle = `${courseA.abbreviation} ${courseA.courseNumber}`;
  let courseBTitle = `${courseB.abbreviation} ${courseB.courseNumber}`;
  return courseATitle.localeCompare(courseBTitle);
};

/**
 * Compares courses by relevance. "Relevance" is only a term relevant to
 * searching so this defaults to "average grade" when not being
 * search-filtered.
 */
export const compareRelevance: CourseComparator = (courseA, courseB) => {
  return 0;
};

/**
 * Comparator for average gpa, break ties by department name
 */
export const compareAverageGrade: CourseComparator = (courseA, courseB) => {
  return (
    courseB.gradeAverage! - courseA.gradeAverage! ||
    compareDepartmentName(courseA, courseB)
  );
};

/**
 * Comparator for open seats, break ties by department name
 */
export const compareOpenSeats: CourseComparator = (courseA, courseB) => {
  return (
    courseB.openSeats! - courseA.openSeats! ||
    compareDepartmentName(courseA, courseB)
  );
};

/**
 * Comparator for enrolled percentage, break ties by department name
 * If percentage is -1, it is put at the end (greater than all other percents)
 */
export const compareEnrollmentPercentage: CourseComparator = (
  courseA,
  courseB
) => {
  if (courseA.enrolledPercentage !== -1 && courseB.enrolledPercentage !== -1) {
    return (
      courseA.enrolledPercentage! - courseB.enrolledPercentage! ||
      compareDepartmentName(courseA, courseB)
    );
  } else if (
    courseA.enrolledPercentage === -1 &&
    courseB.enrolledPercentage === -1
  ) {
    return compareDepartmentName(courseA, courseB);
  } else {
    return courseB.enrolledPercentage! - courseA.enrolledPercentage!;
  }
};

/**
 * Returns comparator based on the sort
 */
export function sortByAttribute(
  sortAttribute: CourseSortAttribute
): CourseComparator {
  switch (sortAttribute) {
    case 'relevance':
      return compareRelevance;
    case 'average_grade':
      return compareAverageGrade;
    case 'department_name':
      return compareDepartmentName;
    case 'open_seats':
      return compareOpenSeats;
    case 'enrolled_percentage':
      return compareEnrollmentPercentage;
  }
}
