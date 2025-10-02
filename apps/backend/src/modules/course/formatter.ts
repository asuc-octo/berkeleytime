import { ICourseItem } from "@repo/common";

import { CourseModule } from "./generated-types/module-types";

interface CourseRelationships {
  classes: null;
  gradeDistribution: null;
  crossListing: string[];
  requiredCourses: string[];
}

export type IntermediateCourse = Omit<
  CourseModule.Course,
  keyof CourseRelationships
> &
  CourseRelationships;

export function formatCourse(course: ICourseItem) {
  const output = {
    ...course,
    gradingBasis: course.gradingBasis as CourseModule.CourseGradingBasis,
    finalExam: course.finalExam as CourseModule.CourseFinalExam,

    classes: null,
    gradeDistribution: null,
    crossListing: course.crossListing ?? [],
    requiredCourses: course.preparation?.requiredCourses ?? [],
    requirementsFulfilled: course.requirementsFulfilled ?? [],
  } as IntermediateCourse;

  return output;
}
