import { IScheduleClass, ScheduleIdentifier } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

export enum RecentType {
  Class = "recent-classes",
  Schedule = "recent-schedules",
  Course = "recent-courses",
  CatalogTerm = "recent-catalog-term",
  GradesPage = "recent-grades-page",
  EnrollmentPage = "recent-enrollment-page",
}

const MaxLength = {
  [RecentType.Class]: 10,
  [RecentType.Schedule]: 5,
  [RecentType.Course]: 3,
  [RecentType.CatalogTerm]: 1,
  [RecentType.GradesPage]: 1,
  [RecentType.EnrollmentPage]: 1,
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
  timestamp?: number;
}

interface RecentPageUrl {
  url: string;
  timestamp: number;
}

export type Recent<T extends RecentType> = T extends RecentType.Class
  ? RecentClass
  : T extends RecentType.Schedule
    ? RecentSchedule
    : T extends RecentType.Course
      ? RecentCourse
      : T extends RecentType.CatalogTerm
        ? RecentCatalogTerm
        : T extends RecentType.GradesPage
          ? RecentPageUrl
          : T extends RecentType.EnrollmentPage
            ? RecentPageUrl
            : never;

export const getRecents = <T extends RecentType>(
  type: T,
  value?: Recent<T>
) => {
  try {
    const storage =
      type === RecentType.GradesPage || type === RecentType.EnrollmentPage
        ? sessionStorage
        : localStorage;

    const item = storage.getItem(type);
    if (!item) return [];

    let recents = JSON.parse(item) as Recent<T>[];

    if (type === RecentType.CatalogTerm) {
      const ONE_HOUR = 60 * 60 * 1000;
      const now = Date.now();

      recents = recents.filter((recent) => {
        const catalogTerm = recent as RecentCatalogTerm;
        return !catalogTerm.timestamp || now - catalogTerm.timestamp < ONE_HOUR;
      }) as Recent<T>[];
    }

    if (type === RecentType.GradesPage || type === RecentType.EnrollmentPage) {
      const ONE_HOUR = 60 * 60 * 1000;
      const now = Date.now();

      recents = recents.filter((recent) => {
        const pageUrl = recent as RecentPageUrl;
        return !pageUrl.timestamp || now - pageUrl.timestamp < ONE_HOUR;
      }) as Recent<T>[];
    }

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

  if (type === RecentType.CatalogTerm) {
    (recent as RecentCatalogTerm).timestamp = Date.now();
  }

  if (type === RecentType.GradesPage || type === RecentType.EnrollmentPage) {
    (recent as RecentPageUrl).timestamp = Date.now();
  }

  recents.unshift(recent);

  const item = JSON.stringify(recents.slice(0, MaxLength[type]));
  const storage =
    type === RecentType.GradesPage || type === RecentType.EnrollmentPage
      ? sessionStorage
      : localStorage;

  storage.setItem(type, item);

  window.dispatchEvent(new CustomEvent("recent-updated", { detail: { type } }));
};

export const removeRecent = <T extends RecentType>(
  type: RecentType,
  recent: Recent<T>
) => {
  const recents = getRecents(type, recent);

  const item = JSON.stringify(recents);
  const storage =
    type === RecentType.GradesPage || type === RecentType.EnrollmentPage
      ? sessionStorage
      : localStorage;

  storage.setItem(type, item);
};

// Helper functions for page URL persistence
export const savePageUrl = (
  type: RecentType.GradesPage | RecentType.EnrollmentPage,
  url: string
) => {
  addRecent(type, {
    url,
    timestamp: Date.now(),
  });
};

export const getPageUrl = (
  type: RecentType.GradesPage | RecentType.EnrollmentPage
): string | null => {
  const saved = getRecents(type) as RecentPageUrl[];
  return saved[0]?.url ?? null;
};
