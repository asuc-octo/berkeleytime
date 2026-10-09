export interface GeneratorPreferences {
  /** Minutes after midnight. Meetings that start earlier rank lower. */
  earliestStart: number | null;
  /** Minutes after midnight. Meetings that end later rank lower. */
  latestEnd: number | null;
  /** Monday first, like section meetings and saved events. */
  avoidDays: boolean[];
  fewerDays: boolean;
  fewerGaps: boolean;
  /** Hard filter: closed sections are never used unless locked. */
  onlyOpenSections: boolean;
}

export const DEFAULT_PREFERENCES: GeneratorPreferences = {
  earliestStart: null,
  latestEnd: null,
  avoidDays: [false, false, false, false, false, false, false],
  fewerDays: false,
  fewerGaps: true,
  onlyOpenSections: false,
};

const STORAGE_KEY = "schedule-generator-preferences";

const toTime = (value: unknown) =>
  typeof value === "number" && value >= 0 && value < 24 * 60 ? value : null;

const toFlag = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

export const sanitizePreferences = (value: unknown): GeneratorPreferences => {
  if (!value || typeof value !== "object") return DEFAULT_PREFERENCES;

  const input = value as Partial<Record<keyof GeneratorPreferences, unknown>>;

  return {
    earliestStart: toTime(input.earliestStart),
    latestEnd: toTime(input.latestEnd),
    avoidDays: DEFAULT_PREFERENCES.avoidDays.map((_, day) =>
      Array.isArray(input.avoidDays) ? input.avoidDays[day] === true : false
    ),
    fewerDays: toFlag(input.fewerDays, DEFAULT_PREFERENCES.fewerDays),
    fewerGaps: toFlag(input.fewerGaps, DEFAULT_PREFERENCES.fewerGaps),
    onlyOpenSections: toFlag(
      input.onlyOpenSections,
      DEFAULT_PREFERENCES.onlyOpenSections
    ),
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
