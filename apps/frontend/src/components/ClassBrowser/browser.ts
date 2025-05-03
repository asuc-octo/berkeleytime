import Fuse from "fuse.js";

import { AcademicCareer, Component, IClass, academicCareers, ISchedule, ISection } from "@/lib/api";
import { subjects } from "@/lib/course";


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
  currentDays: Day[],
  currentOpen: boolean,
  currentOnline: boolean,
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

      acc.includedClasses.push(_class);

      return acc;
    },
    { includedClasses: [] as IClass[], excludedClasses: [] as IClass[]} 
  );
};


export interface TimeSlot {
  day: number[];   
  start: number;  
  end: number;    
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingSectionIds: string[];
}


function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function hasTimeConflict(
  cls: IClass | ISection,
  timeSlots: TimeSlot[]
): ConflictResult {
  const conflictingIds = new Set<string>();
  const sec = "primarySection" in cls ? cls.primarySection : cls;
  // console.log("new1:", timeSlots);

  for (const meeting of sec.meetings ?? []) {
    const mStart = timeToMinutes(meeting.startTime);
    const mEnd   = timeToMinutes(meeting.endTime);

    const meetingDays = meeting.days
      .map((has, idx) => has ? idx : -1)
      .filter(d => d > 0);
    // console.log("new2:", sec.sectionId, meetingDays);
    for (const slot of timeSlots) {

      const common = meetingDays.filter(d => slot.day.includes(d));
      if (common.length === 0) continue;
      // console.log("new5:", sec.sectionId, common);

      if (Math.max(mStart, slot.start) < Math.min(mEnd, slot.end)) {
        conflictingIds.add(sec.sectionId);
        break;
      }
    }
  }

  return {
    hasConflict: conflictingIds.size > 0,
    conflictingSectionIds: Array.from(conflictingIds),
  };
}



export const getIndex = (classes: IClass[]) => {
  const list = classes.map((_class) => {
    const { title, subject, number } = _class.course;

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

  return new Fuse(list, options);
};
