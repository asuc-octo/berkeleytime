import { CourseType } from "../db/course";

/**
 * Used to map between courses and grades
 */
export function getCourseKey(course: CourseType) {
    return `${course.subjectArea?.description} ${course.catalogNumber?.formatted}`;
}

export function getCsCourseId(course: CourseType) {
    return course.identifiers.find(i => i.type == "cs-course-id")?.id as string
}