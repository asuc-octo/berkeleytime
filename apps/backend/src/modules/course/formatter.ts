import { CourseType } from "@repo/common";

import {
  AcademicCareer,
  CourseFinalExam,
  CourseGradingBasis,
  InstructionMethod,
} from "../../generated-types/graphql";
import { formatDate } from "../class/formatter";
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
      course.preparation?.requiredCourses.map?.((course) => {
        const split = course.displayName?.split(" ") as string[];

        const subject = split.slice(0, -1).join(" ");
        const number = split[split.length - 1];

        return `${subject} ${number}`;
      }) ?? [],

    requirements: course.preparation?.requiredText,
    description: course.description as string,
    primaryInstructionMethod: course.primaryInstructionMethod
      ?.code as InstructionMethod,
    fromDate: formatDate(course.fromDate),
    finalExam: course.finalExam?.description as CourseFinalExam,
    gradingBasis: course.gradingBasis?.description as CourseGradingBasis,
    academicCareer: course.academicCareer?.code as AcademicCareer,
    title: course.title as string,
    toDate: formatDate(course.toDate),
    typicallyOffered:
      // @ts-expect-error - The model was typed incorrectly
      course.formatsOffered?.typicallyOffered?.terms?.termNames ??
      course.formatsOffered?.typicallyOffered?.terms,
  } as IntermediateCourse;
}
