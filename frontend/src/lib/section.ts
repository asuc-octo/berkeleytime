import { Semester } from "./api";

export const kindAbbreviations: Record<string, string> = {
  Lecture: "lec",
  Laboratory: "lab",
  Seminar: "sem",
  Discussion: "dis",
  "Independent Study": "ind",
  "Directed Group Study": "grp",
  "Field Work": "fld",
  "Self-paced": "slf",
  Internship: "int",
  "Web-Based Lecture": "wbl",
  Workshop: "wor",
  Clinic: "cln",
  Tutorial: "tut",
  Colloquium: "col",
  Studio: "std",
  Session: "ses",
  Recitation: "rec",
};

export const getExternalLink = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  sectionNumber: string,
  kind: string
) => {
  // TODO: Fix external links
  kind = kindAbbreviations[kind] ?? kind.toLowerCase();

  return `https://classes.berkeley.edu/content/${year}-${semester.toLowerCase()}-${subject.toLowerCase()}-${courseNumber}-${sectionNumber}-${kind}-${sectionNumber}`;
};
