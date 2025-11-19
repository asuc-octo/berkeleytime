import { ICourseItem } from "@repo/common";

import { CourseModule } from "./generated-types/module-types";

interface CourseRelationships {
  classes: null;
  gradeDistribution: null;
  crossListing: string[];
  requiredCourses: string[];
}

interface CourseComputedFields {
  averageGrade: number | null;
  pnpPercentage: number | null;
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
    gradingBasis: course.gradingBasis as CourseModule.CourseGradingBasis,
    finalExam: course.finalExam as CourseModule.CourseFinalExam,

    classes: null,
    gradeDistribution: null,
    crossListing: course.crossListing ?? [],
    requiredCourses: course.preparation?.requiredCourses ?? [],
    requirements: course.preparation?.requiredText ?? null,
    averageGrade: course.averageGrade ?? null,
    pnpPercentage: course.pnpPercentage ?? null,
  } as IntermediateCourse;

  return output;
}
