export type Schedule = {
  courseIds: string[];
  sectionIds: string[];
};

export const DEFAULT_SCHEDULE: Schedule = {
  courseIds: [],
  sectionIds: [],
};
