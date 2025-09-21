import { Semester } from "../../generated-types/graphql";

export type Comment = {
  subject: string;
  courseNumber: string;
  classNumber: string;
  year: number;
  semester: Semester;
  value: string;
};

export type AggregatedComments = {
  comments: Comment[];
  total: number;
};
