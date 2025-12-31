import { IPlanTerm, ISelectedCourse } from "@/lib/api";
import { GetCourseRequirementsQuery } from "@/lib/generated/graphql";

import { Data, FunctionMapEntry, Variables } from "../types";

type JoinedCourse = ISelectedCourse & {
  course?: NonNullable<GetCourseRequirementsQuery["course"]>;
};

export type Column = {
  name: Data<string>;
  courses: Data<JoinedCourse[]>;
  year: Data<number>;
  semester: Data<string>;
  units: Data<number>;
};

export const definedFields = ["name", "courses", "year", "semester", "units"];

export function columnAdapter(
  term: IPlanTerm & { courses: JoinedCourse[] }
): Column {
  return {
    year: {
      data: term.year,
      type: "number",
    },
    semester: {
      data: term.term,
      type: "string",
    },
    name: {
      data: term.name,
      type: "string",
    },
    courses: {
      data: term.courses,
      type: "List<Course>",
    },
    units: {
      data: term.courses.reduce((acc, course) => acc + course.courseUnits, 0),
      type: "number",
    },
  };
}

const SEMESTER_ORDER = ["Winter", "Spring", "Summer", "Fall"];

export const functions: FunctionMapEntry[] = [
  [
    "column_less_than",
    {
      type: "Function<boolean>(Column, Column)",
      data: {
        eval: (_: Variables, arg1: Data<Column>, arg2: Data<Column>) => {
          return {
            data:
              arg1.data.year.data === arg2.data.year.data
                ? SEMESTER_ORDER.indexOf(arg1.data.semester.data) <
                  SEMESTER_ORDER.indexOf(arg2.data.semester.data)
                : arg1.data.year.data < arg2.data.year.data,
            type: "boolean",
          };
        },
        args: ["Column", "Column"],
      },
    },
  ],
  [
    "column_greater_than",
    {
      type: "Function<boolean>(Column, Column)",
      data: {
        eval: (_: Variables, arg1: Data<Column>, arg2: Data<Column>) => {
          return {
            data:
              arg1.data.year.data === arg2.data.year.data
                ? SEMESTER_ORDER.indexOf(arg1.data.semester.data) >
                  SEMESTER_ORDER.indexOf(arg2.data.semester.data)
                : arg1.data.year.data > arg2.data.year.data,
            type: "boolean",
          };
        },
        args: ["Column", "Column"],
      },
    },
  ],
];
