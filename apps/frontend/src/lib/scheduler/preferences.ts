/** How to order the schedules that pass the rules. */
export type SortKey =
  | "fewest-gaps"
  | "fewest-days"
  | "latest-start"
  | "earliest-finish";

export const SORT_KEYS: SortKey[] = [
  "fewest-gaps",
  "fewest-days",
  "latest-start",
  "earliest-finish",
];

/**
 * The student's rules. Sections that break a rule are left out, except
 * sections the student locked.
 */
export interface GeneratorPreferences {
  /** Minutes after midnight. No meeting may start earlier. */
  earliestStart: number | null;
  /** Minutes after midnight. No meeting may end later. */
  latestEnd: number | null;
  /** Monday first, like section meetings and saved events. */
  avoidDays: boolean[];
  onlyOpenSections: boolean;
  sortBy: SortKey;
}

export const DEFAULT_PREFERENCES: GeneratorPreferences = {
  earliestStart: null,
  latestEnd: null,
  avoidDays: [false, false, false, false, false, false, false],
  onlyOpenSections: false,
  sortBy: "fewest-gaps",
};

const STORAGE_KEY = "schedule-generator-preferences";

const toTime = (value: unknown) =>
  typeof value === "number" && value >= 0 && value < 24 * 60 ? value : null;

export const sanitizePreferences = (value: unknown): GeneratorPreferences => {
  if (!value || typeof value !== "object") return DEFAULT_PREFERENCES;

  const input = value as Partial<Record<keyof GeneratorPreferences, unknown>>;

  return {
    earliestStart: toTime(input.earliestStart),
    latestEnd: toTime(input.latestEnd),
    avoidDays: DEFAULT_PREFERENCES.avoidDays.map((_, day) =>
      Array.isArray(input.avoidDays) ? input.avoidDays[day] === true : false
    ),
    onlyOpenSections:
      typeof input.onlyOpenSections === "boolean"
        ? input.onlyOpenSections
        : DEFAULT_PREFERENCES.onlyOpenSections,
    sortBy: SORT_KEYS.includes(input.sortBy as SortKey)
      ? (input.sortBy as SortKey)
      : DEFAULT_PREFERENCES.sortBy,
  };
};

export const loadPreferences = (): GeneratorPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? sanitizePreferences(JSON.parse(stored))
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const savePreferences = (preferences: GeneratorPreferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage can be unavailable (private mode, quota); preferences still apply
    // to this generation.
  }
};

// DaySelect orders days Sunday first; meetings and events are Monday first.
export const toSundayFirst = (days: boolean[]) => [
  days[6],
  ...days.slice(0, 6),
];

export const toMondayFirst = (days: boolean[]) => [...days.slice(1), days[0]];
