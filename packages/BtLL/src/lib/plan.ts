// no constructor
import { Data } from "../types";
import { Column } from "./column";
import { Course } from "./course";

export type Plan = {
  columns: Data<Column[]>;
  allCourses: Data<Course[]>;
  units: Data<number>;
};

export const definedFields = ["columns", "allCourses", "units"];
