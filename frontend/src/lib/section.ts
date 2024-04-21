import { Semester } from "./api";

interface Kind {
  name: string;
  shorthand: string;
  plural: string;
}

export const kinds: Record<string, Kind> = {
  Discussion: {
    name: "Discussion",
    plural: "Discussions",
    shorthand: "dis",
  },
  Lecture: {
    name: "Lecture",
    plural: "Lectures",
    shorthand: "lec",
  },
  Laboratory: {
    name: "Lab",
    plural: "Labs",
    shorthand: "lab",
  },
  Seminar: {
    name: "Seminar",
    plural: "Seminars",
    shorthand: "sem",
  },
  "Independent Study": {
    name: "Independent Study",
    plural: "Independent Studies",
    shorthand: "ind",
  },
  "Directed Group Study": {
    name: "Directed Group Study",
    plural: "Directed Group Studies",
    shorthand: "grp",
  },
  "Field Work": {
    name: "Field Work",
    plural: "Field Works",
    shorthand: "fld",
  },
};

// TODO: External links
export const getExternalLink = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  sectionNumber: string,
  kind: string
) => {
  kind = kinds[kind]?.shorthand || kind.toLowerCase();

  return `https://classes.berkeley.edu/content/${year}-${semester.toLowerCase()}-${subject.toLowerCase()}-${courseNumber}-${sectionNumber}-${kind}-${sectionNumber}`;
};
