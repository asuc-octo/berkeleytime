import { CourseType } from "../models/course";

/**
 * Used to map between courses and grades
 */
export function getCourseKey(course: CourseType) {
    const subjectArea = course.classSubjectArea?.description ?? course.subjectArea?.description;
    return `${subjectArea} ${course.catalogNumber?.formatted}`;
}

export function getCsCourseId(course: CourseType) {
    return course.identifiers.find(i => i.type == "cs-course-id")?.id as string
}