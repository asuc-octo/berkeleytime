import { ISelectedCourse } from "@/lib/api";
import {
  GetCourseRequirementsQuery,
  SelectedCourse,
} from "@/lib/generated/graphql";

import { Data } from "../types";

export type Course = {
  subject: Data<string>;
  number: Data<string>;
  units: Data<number>;
  breadthRequirements: Data<string[]>;
  universityRequirement: Data<string>;
};

export const definedFields = [
  "subject",
  "number",
  "units",
  "universityRequirement",
  "breadthRequirements",
];

export function courseAdapter(
  course: ISelectedCourse & {
    course?: NonNullable<GetCourseRequirementsQuery["course"]>;
  }
): Course {
  return {
    subject: {
      data: course.courseName.split(" ")[0],
      type: "string",
    },
    number: {
      data: course.courseName.split(" ")[1],
      type: "string",
    },
    units: {
      data: course.courseUnits,
      type: "number",
    },
    universityRequirement: {
      data: course.course?.mostRecentClass?.requirementDesignation?.code ?? "",
      type: "string",
    },
    breadthRequirements: {
      data:
        course.course?.mostRecentClass?.primarySection?.sectionAttributes
          ?.filter((s) => s.attribute.code === "GE")
          .map((sectionAttribute) => sectionAttribute.attribute.description)
          .filter((s) => s !== null && s !== undefined) ?? [],
      type: "List<string>",
    },
  };
}
