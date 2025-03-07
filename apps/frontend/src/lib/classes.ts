const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

export function sortDescendingTerm(objFetch: (data: any) => any) {
  return (a: any, b: any) => {
    const objA = objFetch(a);
    const objB = objFetch(b);
    return objA.year === objB.year
      ? SEMESTER_ORDER.indexOf(objB.semester) -
          SEMESTER_ORDER.indexOf(objA.semester)
      : objB.year - objA.year;
  };
}