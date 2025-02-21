import { ICourseItem } from "@repo/common";

import { CourseModule } from "./generated-types/module-types";

export interface CourseRelationships {
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

    classes: null,
    gradeDistribution: null,
    crossListing: course.crossListing ?? [],
    requiredCourses: course.preparation?.requiredCourses ?? [],
  } as IntermediateCourse;

  return output;
}
