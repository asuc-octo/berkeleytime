import { CourseFragment, CourseOverviewFragment } from "graphql/graphql";
import { hash } from "utils/string";

export type CourseReference = {
  abbreviation: string;
  courseNumber: string;
};

/**
 * Checks if a course matches a refernece.
 */
export const isSameCourse = (
  reference: CourseReference | null,
  course: CourseOverviewFragment
) =>
  reference !== null &&
  course.abbreviation === reference.abbreviation &&
  course.courseNumber === reference.courseNumber;

/**
 * Course to a course name
 * @example
 * courseToName(course) == "COMPSCI 61B"
 */
export function courseToName(
  course:
    | Pick<CourseFragment, "abbreviation" | "courseNumber">
    | CourseReference
    | null
    | undefined
): string {
  return course ? `${course.abbreviation} ${course.courseNumber}` : "";
}

/**
 * Color palette for courses
 */
export const COURSE_PALETTE = [
  "#1AA8E5",
  "#18DE83",
  "#FCD571",
  "#ED5186",
  "#FFA414",
];

/**
 * Gets a color for a course
 * @param course Either a course object or the courseId.
 * @returns a CSS color code.
 */
export function courseToColor(
  course: Pick<CourseFragment, "id"> | string | null
): string {
  return COURSE_PALETTE[
    (course ? hash(typeof course === "string" ? course : course.id) : 0) %
      COURSE_PALETTE.length
  ];
}
