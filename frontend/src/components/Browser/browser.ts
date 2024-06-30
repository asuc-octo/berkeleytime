import { AcademicCareer, Component, IClass, academicCareers } from "@/lib/api";

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

export enum Day {
  Sunday = "0",
  Monday = "1",
  Tuesday = "2",
  Wednesday = "3",
  Thursday = "4",
  Friday = "5",
  Saturday = "6",
}

export const getLevel = (academicCareer: AcademicCareer, number: string) => {
  return academicCareer === AcademicCareer.Undergraduate
    ? number.match(/(\d)\d\d/)
      ? Level.UpperDivision
      : Level.LowerDivision
    : (academicCareers[academicCareer] as Level);
};

export const getFilteredClasses = (
  classes: IClass[],
  currentComponents: Component[],
  currentUnits: Unit[],
  currentLevels: Level[],
  currentDays: Day[]
) => {
  return classes.reduce(
    (acc, _class) => {
      // Filter by component
      if (currentComponents.length > 0) {
        const { component } = _class.primarySection;

        if (!currentComponents.includes(component)) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      // Filter by level
      if (currentLevels.length > 0) {
        const level = getLevel(
          _class.course.academicCareer,
          _class.course.number
        );

        if (!currentLevels.includes(level)) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      // Filter by units
      if (currentUnits.length > 0) {
        const unitsMin = Math.floor(_class.unitsMin);
        const unitsMax = Math.floor(_class.unitsMax);

        const includesUnits = [...Array(unitsMax - unitsMin || 1)].some(
          (_, index) => {
            const units = unitsMin + index;

            return currentUnits.includes(
              unitsMin + index === 5 ? Unit.FivePlus : (`${units}` as Unit)
            );
          }
        );

        if (!includesUnits) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      // Filter by days
      if (currentDays.length > 0) {
        const includesDays = currentDays.some(
          (day) => _class.primarySection.meetings?.[0]?.days[parseInt(day)]
        );

        if (!includesDays) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      acc.includedClasses.push(_class);

      return acc;
    },
    { includedClasses: [], excludedClasses: [] } as {
      includedClasses: IClass[];
      excludedClasses: IClass[];
    }
  );
};
