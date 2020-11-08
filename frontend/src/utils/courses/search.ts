import { CourseOverviewFragment, CourseType } from "graphql/graphql";
import { combineQueries, normalizeSearchTerm, search } from "utils/search";

export type SearchableCourse = CourseOverviewFragment;

/**
 * Applies search query over list of courses
 */
export function searchCourses(courses: SearchableCourse[], rawQuery: string): SearchableCourse[] {
    const query = normalizeSearchTerm(rawQuery);
    const results = courses
      .map<[SearchableCourse, number]>((course) => [
        course,
        combineQueries(
          search(query, getFullCourseCode(course), 1),
          search(query, `${course.title}`.toLowerCase(), 0.3, 0.05)
        ),
      ])
      .filter(([_, distance]) => distance >= 0)
      .sort((a, b) => a[1] - b[1])
      .map(([course]) => course);

    return results;
}

/**
 * Course object to a fully-descriptive course search string.
 */
export function getFullCourseCode(course: SearchableCourse): string {
    const searchComponents = [course.abbreviation, course.courseNumber];
    return searchComponents.join(" ").toLowerCase();
}
