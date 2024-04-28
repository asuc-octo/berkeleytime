import { ICatalogCourse } from "@/lib/api";

export enum SortBy {
  Relevance = "Relevance",
  Units = "Units",
  AverageGrade = "Average grade",
  OpenSeats = "Open seats",
  PercentOpenSeats = "Percent open seats",
}

export const getLevel = (level: string, number: string) => {
  if (level !== "Undergraduate") return level;

  return level === "Undergraduate"
    ? number.match(/(\d)\d\d/)
      ? "Upper Division"
      : "Lower Division"
    : level;
};

export const getFilteredCourses = (
  courses: ICatalogCourse[],
  currentKinds: string[],
  currentUnits: string[],
  currentLevels: string[]
) => {
  return courses.reduce(
    (acc, course) => {
      // Filter by kind
      const kind = course.classes[0].primarySection.kind;

      if (currentKinds.length > 0 && !currentKinds.includes(kind)) {
        acc.excludedCourses.push(course);

        return acc;
      }

      // Filter by level
      const level = getLevel(course.level, course.number);

      if (currentLevels.length > 0 && !currentLevels.includes(level)) {
        acc.excludedCourses.push(course);

        return acc;
      }

      // Filter by units
      const { unitsMin, unitsMax } = course.classes.reduce(
        (acc, { unitsMax, unitsMin }) => ({
          unitsMin: Math.min(5, Math.floor(Math.min(acc.unitsMin, unitsMin))),
          unitsMax: Math.min(Math.floor(Math.max(acc.unitsMax, unitsMax))),
        }),
        { unitsMax: 0, unitsMin: Infinity }
      );

      const includesUnits = [...Array(unitsMax - unitsMin || 1)].some(
        (_, index) => {
          const units = unitsMin + index;

          return currentUnits.includes(
            unitsMin + index === 5 ? "5+" : `${units}`
          );
        }
      );

      if (currentUnits.length > 0 && !includesUnits) {
        acc.excludedCourses.push(course);

        return acc;
      }

      acc.includedCourses.push(course);

      return acc;
    },
    { includedCourses: [], excludedCourses: [] } as {
      includedCourses: ICatalogCourse[];
      excludedCourses: ICatalogCourse[];
    }
  );
};
