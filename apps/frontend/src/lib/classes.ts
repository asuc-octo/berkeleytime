const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

const SEMESTER_INDEX = new Map(
  SEMESTER_ORDER.map((semester, index) => [semester, index])
);

interface PartialTerm {
  year: number;
  semester: string;
}

export const sortByTermDescending = <T extends PartialTerm>(a: T, b: T) => {
  return a.year === b.year
    ? (SEMESTER_INDEX.get(b.semester) ?? 0) -
        (SEMESTER_INDEX.get(a.semester) ?? 0)
    : b.year - a.year;
};
