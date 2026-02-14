import {
  ICatalogClass,
  ISectionAttribute,
  ISectionAttriuteInfo,
  academicCareersMap,
} from "@/lib/api";
import { SUBJECT_NICKNAME_MAP } from "@/lib/departmentNicknames";
import { AcademicCareer, ClassGradingBasis } from "@/lib/generated/graphql";
import { FuzzySearch } from "@repo/common";

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

export type UnitRange = [number, number];

// TimeRange is [fromTime, toTime] in "HH:MM" format (24-hour)
// Default [null, null] means no filtering (all times)
export type TimeRange = [string | null, string | null];

// Helper to parse "HH:MM" time string to minutes since midnight
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

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
export enum GradingBasis {
  ESU = "ESU",
  SUS = "SUS",
  OPT = "OPT",
  PNP = "PNP",
  BMT = "BMT",
  GRD = "GRD",
  IOP = "IOP",
}

export enum GradingFilter {
  Graded = "Graded",
  PassNoPass = "Pass/Not Pass",
  Other = "Other",
}

export const gradingBasisCategoryMap: Record<ClassGradingBasis, GradingFilter> =
  {
    [ClassGradingBasis.Opt]: GradingFilter.Graded,
    [ClassGradingBasis.Grd]: GradingFilter.Graded,
    [ClassGradingBasis.Pnp]: GradingFilter.PassNoPass,
    [ClassGradingBasis.Esu]: GradingFilter.Other,
    [ClassGradingBasis.Sus]: GradingFilter.Other,
    [ClassGradingBasis.Bmt]: GradingFilter.Other,
    [ClassGradingBasis.Iop]: GradingFilter.Other,
    [ClassGradingBasis.Cnc]: GradingFilter.Other,
    [ClassGradingBasis.Law]: GradingFilter.Other,
    [ClassGradingBasis.Lw1]: GradingFilter.Other,
  };

export const getLevel = (academicCareer: AcademicCareer, number: string) => {
  return academicCareer === AcademicCareer.Ugrd
    ? number.match(/(\d)\d\d/)
      ? Level.UpperDivision
      : Level.LowerDivision
    : (academicCareersMap[academicCareer] as Level);
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

export const getAllBreadthRequirements = (
  classes: ICatalogClass[]
): Breadth[] => {
  const allBreadths = new Set<Breadth>();

  classes.forEach((_class) => {
    const breadths = getBreadthRequirements(
      _class.primarySection.sectionAttributes ?? []
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
  classes: ICatalogClass[]
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
  classes: ICatalogClass[],
  currentUnits: UnitRange,
  currentLevels: Level[],
  currentDays: Day[],
  currentOpen: boolean,
  currentOnline: boolean,
  currentBreadths: Breadth[] = [],
  currentUniversityRequirement: UniversityRequirement | null = null,
  currentGradingFilters: GradingFilter[] = [],
  currentAcademicOrganization: string | null = null,
  currentTimeRange: TimeRange = [null, null]
) => {
  return classes.reduce(
    (acc, _class) => {
      // Filter by open
      if (
        currentOpen &&
        _class.primarySection.enrollment?.latest?.status !== "O"
      ) {
        acc.excludedClasses.push(_class);

        return acc;
      }

      // Filter by online
      if (currentOnline && !_class.primarySection.online) {
        acc.excludedClasses.push(_class);

        return acc;
      }

      // Filter by level
      if (currentLevels.length > 0) {
        const level = getLevel(
          _class.course.academicCareer,
          _class.courseNumber
        );

        if (!currentLevels.includes(level)) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      // Filter by units - check if class unit range overlaps with filter range
      // Default range [0, 5] means no filtering
      if (currentUnits[0] !== 0 || currentUnits[1] !== 5) {
        const unitsMin = Math.floor(_class.unitsMin);
        const unitsMax = Math.floor(_class.unitsMax);
        const classMaxCapped = Math.min(unitsMax, 5); // Cap at 5 for 5+ classes

        // Check if ranges overlap
        const overlaps =
          classMaxCapped >= currentUnits[0] && unitsMin <= currentUnits[1];

        if (!overlaps) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      // Filter by days
      if (currentDays.length > 0) {
        const includesDays = currentDays.some(
          (day) => _class.primarySection.meetings?.[0]?.days?.[parseInt(day)]
        );

        if (!includesDays) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      // Filter by time range
      if (currentTimeRange[0] !== null || currentTimeRange[1] !== null) {
        const meeting = _class.primarySection.meetings?.[0];
        const meetingStart = meeting?.startTime;
        const meetingEnd = meeting?.endTime;

        // If class has no meeting times, exclude it when time filter is active
        if (!meetingStart || !meetingEnd) {
          acc.excludedClasses.push(_class);
          return acc;
        }

        const filterFrom = currentTimeRange[0]
          ? parseTimeToMinutes(currentTimeRange[0])
          : 0;
        const filterTo = currentTimeRange[1]
          ? parseTimeToMinutes(currentTimeRange[1])
          : 24 * 60 - 1;

        const classStart = parseTimeToMinutes(meetingStart);
        const classEnd = parseTimeToMinutes(meetingEnd);

        // Check if class time overlaps with filter range
        // Class must start at or after filterFrom AND end at or before filterTo
        const isWithinRange = classStart >= filterFrom && classEnd <= filterTo;

        if (!isWithinRange) {
          acc.excludedClasses.push(_class);
          return acc;
        }
      }

      // Filter by breadth requirements
      if (currentBreadths.length > 0) {
        const classBreadths = getBreadthRequirements(
          _class.primarySection.sectionAttributes ?? []
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

      if (currentGradingFilters.length > 0) {
        const basis = _class.gradingBasis ?? "";
        const category = gradingBasisCategoryMap[basis] ?? GradingFilter.Other;

        if (!currentGradingFilters.includes(category)) {
          acc.excludedClasses.push(_class);

          return acc;
        }
      }

      if (
        currentAcademicOrganization &&
        _class.course.academicOrganization !== currentAcademicOrganization
      ) {
        acc.excludedClasses.push(_class);

        return acc;
      }

      acc.includedClasses.push(_class);

      return acc;
    },
    { includedClasses: [], excludedClasses: [] } as {
      includedClasses: ICatalogClass[];
      excludedClasses: ICatalogClass[];
    }
  );
};

export const getIndex = (classes: ICatalogClass[]) => {
  const list = classes.map((_class) => {
    const subject = _class.subject;
    const number = _class.courseNumber;
    const title = _class.course.title;
    const departmentNicknames = _class.course.departmentNicknames;

    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const sisNicknames = departmentNicknames
      ? departmentNicknames
          .split("!")
          .map((abbr: string) => abbr.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const hardcodedNicknames = (SUBJECT_NICKNAME_MAP[subject] || []).map((n) =>
      n.toLowerCase()
    );

    const abbreviations = [
      ...new Set([...sisNicknames, ...hardcodedNicknames]),
    ];

    const alternateNames = abbreviations.reduce(
      (acc, abbreviation) => {
        const abbrevs = [
          `${abbreviation}${number}`,
          `${abbreviation} ${number}`,
        ];

        if (containsPrefix) {
          abbrevs.push(
            `${abbreviation}${alternateNumber}`,
            `${abbreviation} ${alternateNumber}`
          );
        }

        return [...acc, ...abbrevs];
      },
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
