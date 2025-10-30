import {
  AcademicCareer,
  Component,
  IClass,
  ISectionAttribute,
  ISectionAttriuteInfo,
  academicCareers,
} from "@/lib/api";
import { subjects } from "@/lib/course";
import { FuzzySearch } from "@/utils/fuzzy-find";

export enum SortBy {
  Relevance = "Relevance",
  Units = "Units",
  AverageGrade = "Average grade",
  OpenSeats = "Open seats",
  PercentOpenSeats = "Open seats (%)",
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

export type Breadth = string;
export type UniversityRequirement = string;

export const getLevel = (academicCareer: AcademicCareer, number: string) => {
  return academicCareer === AcademicCareer.Undergraduate
    ? number.match(/(\d)\d\d/)
      ? Level.UpperDivision
      : Level.LowerDivision
    : (academicCareers[academicCareer] as Level);
};

export const getBreadthRequirements = (
  sectionAttributes: ISectionAttribute[]
): Breadth[] => {
  if (!sectionAttributes) return [];

  const geAttributes = sectionAttributes.filter(
    (attr) => attr.attribute?.code === "GE"
  );

  const breadths = geAttributes
    .map((attr) => attr.value?.description ?? "")
    .filter(Boolean);

  return breadths;
};

export const getAllBreadthRequirements = (classes: IClass[]): Breadth[] => {
  const allBreadths = new Set<Breadth>();

  classes.forEach((_class) => {
    const breadths = getBreadthRequirements(
      _class.primarySection.sectionAttributes
    );
    breadths.forEach((breadth) => allBreadths.add(breadth));
  });

  return Array.from(allBreadths).sort();
};

export const getUniversityRequirements = (
  requirementDesignation?: ISectionAttriuteInfo
): UniversityRequirement[] => {
  if (!requirementDesignation || !requirementDesignation.description) return [];

  return [requirementDesignation.description];
};

export const getAllUniversityRequirements = (
  classes: IClass[]
): UniversityRequirement[] => {
  const allRequirements = new Set<UniversityRequirement>();

  classes.forEach((_class) => {
    const requirements = getUniversityRequirements(
      _class.requirementDesignation
    );
    requirements.forEach((req) => allRequirements.add(req));
  });

  return Array.from(allRequirements).sort();
};

export const getFilteredClasses = (
  classes: IClass[],
  currentComponents: Component[],
  currentUnits: Unit[],
  currentLevels: Level[],
  currentDays: Day[],
  currentOpen: boolean,
  currentOnline: boolean,
  currentBreadths: Breadth[] = [],
  currentUniversityRequirement: UniversityRequirement | null = null
) => {
  return classes.reduce(
    (acc, _class) => {
      // Filter by open
      if (
        currentOpen &&
        _class.primarySection.enrollment?.latest.status !== "O"
      ) {
        acc.excludedClasses.push(_class);

        return acc;
      }

      // Filter by online
      if (currentOnline && !_class.primarySection.online) {
        acc.excludedClasses.push(_class);

        return acc;
      }

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

      // Filter by breadth requirements
      if (currentBreadths.length > 0) {
        const classBreadths = getBreadthRequirements(
          _class.primarySection.sectionAttributes
        );
        const matchesAnyBreadth = currentBreadths.some((breadth) =>
          classBreadths.includes(breadth)
        );

        if (!matchesAnyBreadth) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      // Filter by university requirement
      if (currentUniversityRequirement) {
        const classRequirements = getUniversityRequirements(
          _class.requirementDesignation
        );
        const hasRequirement = classRequirements.includes(
          currentUniversityRequirement
        );

        if (!hasRequirement) {
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

export const getIndex = (classes: IClass[]) => {
  const list = classes.map((_class) => {
    const subject = _class.subject;
    const number = _class.courseNumber;
    const title = _class.course.title;

    // For prefixed courses, prefer the number and add an abbreviation with the prefix
    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const term = subject.toLowerCase();

    const alternateNames = subjects[term]?.abbreviations.reduce(
      (acc, abbreviation) => {
        // Add alternate names for abbreviations
        const abbreviations = [
          `${abbreviation}${number}`,
          `${abbreviation} ${number}`,
        ];

        if (containsPrefix) {
          abbreviations.push(
            `${abbreviation}${alternateNumber}`,
            `${abbreviation} ${alternateNumber}`
          );
        }

        return [...acc, ...abbreviations];
      },
      // Add alternate names
      containsPrefix
        ? [
            `${subject}${number}`,
            `${subject} ${alternateNumber}`,
            `${subject}${alternateNumber}`,
          ]
        : [`${subject}${number}`]
    );

    return {
      title: _class.title ?? title,
      // subject,
      // number,
      name: `${subject} ${number}`,
      alternateNames,
    };
  });

  // Attempt to increase performance by dropping unnecessary fields
  const options = {
    includeScore: true,
    isCaseSensitive: false,
    // ignoreLocation: true,
    threshold: 0.25,
    keys: [
      // { name: "number", weight: 1.2 },
      "name",
      "title",
      {
        name: "alternateNames",
        weight: 2,
      },
      // { name: "subject", weight: 1.5 },
    ],
    // sortFn: (a: any, b: any) => {
    //   // First, sort by score
    //   if (a.score - b.score) return a.score - b.score;

    //   // Otherwise, sort by number
    //   return a.item[0].v.toLowerCase().localeCompare(b.item[0].v.toLowerCase());
    // },
  };

  return new FuzzySearch(list, options);
};
