import { Semester } from "../../generated-types/graphql";

export type Comment = {
  subject: string;
  courseNumber: string;
  classNumber?: string | null;
  year: number;
  semester: Semester;
  value: string;
};

export type AggregatedComments = {
  comments: Comment[];
  total: number;
};
