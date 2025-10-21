import { IScheduleClass, ScheduleIdentifier, Semester } from "@/lib/api";

export enum RecentType {
  Class = "recent-classes",
  Schedule = "recent-schedules",
  Course = "recent-courses",
  CatalogTerm = "recent-catalog-term",
}

const MaxLength = {
  [RecentType.Class]: 10,
  [RecentType.Schedule]: 5,
  [RecentType.Course]: 5,
  [RecentType.CatalogTerm]: 1,
};

interface RecentClass {
  subject: string;
  year: number;
  semester: Semester;
  courseNumber: string;
  number: string;
}

interface RecentSchedule {
  _id: ScheduleIdentifier;
  name: string;
  classes: IScheduleClass[];
  semester: Semester;
  year: number;
}

interface RecentCourse {
  subject: string;
  number: string;
}

interface RecentCatalogTerm {
  semester: Semester;
  year: number;
}

export type Recent<T extends RecentType> = T extends RecentType.Class
  ? RecentClass
  : T extends RecentType.Schedule
    ? RecentSchedule
    : T extends RecentType.Course
      ? RecentCourse
      : RecentCatalogTerm;

export const getRecents = <T extends RecentType>(
  type: T,
  value?: Recent<T>
) => {
  try {
    const item = localStorage.getItem(type);
    if (!item) return [];

    const recents = JSON.parse(item) as Recent<T>[];
    if (!value) return recents;

    return recents.filter((recent) => {
      let equal = true;

      for (const key of Object.keys(recent)) {
        if (
          recent[key as keyof typeof recent] ===
          value[key as keyof typeof value]
        )
          continue;

        equal = false;

        break;
      }

      return !equal;
    });
  } catch {
    return [];
  }
};

export const addRecent = <T extends RecentType>(
  type: RecentType,
  recent: Recent<T>
) => {
  const recents = getRecents(type, recent);
  recents.unshift(recent);

  const item = JSON.stringify(recents.slice(0, MaxLength[type]));
  localStorage.setItem(type, item);
};

export const removeRecent = <T extends RecentType>(
  type: RecentType,
  recent: Recent<T>
) => {
  const recents = getRecents(type, recent);

  const item = JSON.stringify(recents);
  localStorage.setItem(type, item);
};
