import { CourseType } from "@repo/common";

import {
  AcademicCareer,
  CourseFinalExam,
  CourseGradingBasis,
  InstructionMethod,
} from "../../generated-types/graphql";
import { CourseModule } from "./generated-types/module-types";

export type IntermediateCourse = Omit<
  CourseModule.Course,
  "classes" | "crossListing" | "requiredCourses"
> & {
  classes: null;
  crossListing: string[];
  requiredCourses: string[];
};

export function formatCourse(course: CourseType) {
  return {
    subject: course.subjectArea?.code as string,
    number: course.catalogNumber?.formatted as string,

    classes: null,
    crossListing: course.crossListing?.courses ?? [],
    requiredCourses:
      course.preparation?.requiredCourses.map?.(
        (course) =>
          `${course.subjectArea?.code} ${course.catalogNumber?.formatted}`
      ) ?? [],

    requirements: course.preparation?.requiredText,
    description: course.description as string,
    primaryInstructionMethod: course.primaryInstructionMethod
      ?.code as InstructionMethod,
    fromDate: course.fromDate as string,
    finalExam: course.finalExam?.description as CourseFinalExam,
    gradingBasis: course.gradingBasis?.description as CourseGradingBasis,
    academicCareer: course.academicCareer?.code as AcademicCareer,
    title: course.title as string,
    toDate: course.toDate?.toISOString?.() as string,
    typicallyOffered:
      // @ts-expect-error - The model was typed incorrectly
      course.formatsOffered?.typicallyOffered?.terms?.termNames ??
      course.formatsOffered?.typicallyOffered?.terms,
  } as IntermediateCourse;
}
