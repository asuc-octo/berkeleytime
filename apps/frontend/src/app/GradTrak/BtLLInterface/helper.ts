import { type Data } from "@repo/BtLL";

import { ISelectedCourse } from "@/lib/api";
import { GetCourseRequirementsQuery } from "@/lib/generated/graphql";

export type JoinedCourse = ISelectedCourse & {
  course?: GetCourseRequirementsQuery["course"];
};

// Type definitions
export type Course = {
  subject: Data<string>;
  number: Data<string>;
  units: Data<number>;
  breadthRequirements: Data<string[]>;
  universityRequirement: Data<string>;
};

export type Column = {
  name: Data<string>;
  courses: Data<JoinedCourse[]>;
  year: Data<number>;
  semester: Data<string>;
  units: Data<number>;
};

export type Plan = {
  columns: Data<Column[]>;
  allCourses: Data<Course[]>;
  units: Data<number>;
};
