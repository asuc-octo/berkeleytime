import { Component, Semester } from "./api";

export const getExternalLink = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  sectionNumber: string,
  kind: Component
) => {
  return `https://classes.berkeley.edu/content/${year}-${semester.toLowerCase()}-${subject.toLowerCase()}-${courseNumber}-${sectionNumber}-${kind.toLowerCase()}-${sectionNumber}`;
};
