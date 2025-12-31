// no constructor
import { IPlan } from "@/lib/api";

import { Data } from "../types";
import { Column, columnAdapter } from "./column";
import { Course, courseAdapter } from "./course";

export type Plan = {
  columns: Data<Column[]>;
  allCourses: Data<Course[]>;
  units: Data<number>;
};

export const definedFields = ["columns", "allCourses", "units"];

export function planAdapter(plan: IPlan, columns: Column[]): Plan {
  const allCourses = columns.flatMap((column) =>
    column.courses.data.map(courseAdapter)
  );
  return {
    units: {
      data: allCourses.reduce((acc, course) => acc + course.units.data, 0),
      type: "number",
    },
    columns: {
      data: columns,
      type: "List<Column>",
    },
    allCourses: {
      data: allCourses,
      type: "List<Course>",
    },
  };
}
