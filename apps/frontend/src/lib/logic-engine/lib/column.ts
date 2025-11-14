import { ISelectedCourse, IPlanTerm } from "@/lib/api";
import { Data } from "../types";

export type Column = {
  name: Data<string>;
  courses: Data<ISelectedCourse[]>;
};

export const definedFields = ["name", "courses"];

export function columnAdapter(term: IPlanTerm): Column {
  return {
    name: {
      data: term.name,
      type: "string"
    },
    courses: {
      data: term.courses,
      type: "List<Course>"
    }
  }
}