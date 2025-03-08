const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

interface PartialTerm {
  year: number;
  semester: string;
}

export const sortByTermDescending = <T extends PartialTerm>(a: T, b: T) => {
  return a.year === b.year
    ? SEMESTER_ORDER.indexOf(b.semester) - SEMESTER_ORDER.indexOf(a.semester)
    : b.year - a.year;
};
