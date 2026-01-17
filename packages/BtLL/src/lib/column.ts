import { Data, FunctionMapEntry, Variables } from "../types";

export type Column = {
  name: Data<string>;
  courses: Data<any[]>;
  year: Data<number>;
  semester: Data<string>;
  units: Data<number>;
};

export const definedFields = ["name", "courses", "year", "semester", "units"];

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
