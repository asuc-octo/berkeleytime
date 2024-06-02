import { AcademicCareer, Component, ICourse, academicCareers } from "@/lib/api";

export enum SortBy {
  Relevance = "Relevance",
  Units = "Units",
  AverageGrade = "Average grade",
  OpenSeats = "Open seats",
  PercentOpenSeats = "Percent open seats",
}

export enum Level {
  LowerDivision = "Lower Division",
  UpperDivision = "Upper Division",
  Graduate = "Graduate",
  Extension = "Extension",
}

export enum Unit {
  FivePlus = "5+",
  Four = "4",
  Three = "3",
  Two = "2",
  One = "1",
  Zero = "0",
}

export const getLevel = (academicCareer: AcademicCareer, number: string) => {
  return academicCareer === AcademicCareer.Undergraduate
    ? number.match(/(\d)\d\d/)
      ? Level.UpperDivision
      : Level.LowerDivision
    : (academicCareers[academicCareer] as Level);
};

export const getFilteredCourses = (
  courses: ICourse[],
  currentComponents: Component[],
  currentUnits: Unit[],
  currentLevels: Level[]
) => {
  return courses.reduce(
    (acc, course) => {
      // Filter by component
      const { component } = course.classes[0].primarySection;

      if (
        currentComponents.length > 0 &&
        !currentComponents.includes(component)
      ) {
        acc.excludedCourses.push(course);

        return acc;
      }

      // Filter by level
      const level = getLevel(course.academicCareer, course.number);

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
            unitsMin + index === 5 ? Unit.FivePlus : (`${units}` as Unit)
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
      includedCourses: ICourse[];
      excludedCourses: ICourse[];
    }
  );
};
