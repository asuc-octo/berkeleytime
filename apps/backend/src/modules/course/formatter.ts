import { ICourseItem } from "@repo/common/models";

import { normalizeSubject } from "../../utils/subject";
import { CourseModule } from "./generated-types/module-types";

interface CourseRelationships {
  classes: null;
  gradeDistribution: null;
  crossListing: string[];
  requiredCourses: string[];
}

interface CourseComputedFields {
  allTimeAverageGrade: number | null;
  allTimePassCount: number | null;
  allTimeNoPassCount: number | null;
}

export type IntermediateCourse = Omit<
  CourseModule.Course,
  keyof CourseRelationships
> &
  CourseRelationships &
  CourseComputedFields;

export function formatCourse(course: ICourseItem) {
  const output = {
    ...course,
    subject: normalizeSubject(course.subject),
    gradingBasis: course.gradingBasis as CourseModule.CourseGradingBasis,
    finalExam: course.finalExam as CourseModule.CourseFinalExam,

    classes: null,
    gradeDistribution: null,
    crossListing: course.crossListing ?? [],
    requiredCourses: course.preparation?.requiredCourses ?? [],
    requirements: course.preparation?.requiredText ?? null,
    allTimeAverageGrade: course.allTimeAverageGrade ?? null,
    allTimePassCount: course.allTimePassCount ?? null,
    allTimeNoPassCount: course.allTimeNoPassCount ?? null,
  } as IntermediateCourse;

  return output;
}
