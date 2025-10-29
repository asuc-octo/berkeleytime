import { Semester } from "@/lib/api";

const STORAGE_KEY = "recently-viewed-classes";
const MAX_ITEMS_PER_TERM = 3;

export interface RecentlyViewedClass {
  subject: string;
  courseNumber: string;
  number: string;
  viewedAt: number; // timestamp
}

interface TermKey {
  year: number;
  semester: Semester;
}

type RecentlyViewedMap = Record<string, RecentlyViewedClass[]>;

/**
 * Creates a string key from year and semester
 */
const getTermKey = (year: number, semester: Semester): string => {
  return `${year}-${semester}`;
};

/**
 * Parses a term key back into year and semester
 */
const parseTermKey = (key: string): TermKey | null => {
  const parts = key.split("-");
  if (parts.length !== 2) return null;

  const year = parseInt(parts[0]);
  const semester = parts[1] as Semester;

  if (isNaN(year) || !semester) return null;

  return { year, semester };
};

/**
 * Gets the recently viewed map from localStorage
 */
const getRecentlyViewedMap = (): RecentlyViewedMap => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return {};
    return JSON.parse(item) as RecentlyViewedMap;
  } catch {
    return {};
  }
};

/**
 * Saves the recently viewed map to localStorage and dispatches update event
 */
const saveRecentlyViewedMap = (map: RecentlyViewedMap): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event("recently-viewed-updated"));
  } catch (error) {
    console.error("Failed to save recently viewed classes:", error);
  }
};

/**
 * Gets recently viewed classes for a specific term
 */
export const getRecentlyViewedForTerm = (
  year: number,
  semester: Semester
): RecentlyViewedClass[] => {
  const map = getRecentlyViewedMap();
  const key = getTermKey(year, semester);
  return map[key] ?? [];
};

/**
 * Adds a class to recently viewed for a specific term
 * Maintains max 3 items per term, removing oldest if needed
 */
export const addRecentlyViewed = (
  year: number,
  semester: Semester,
  classData: Omit<RecentlyViewedClass, "viewedAt">
): void => {
  const map = getRecentlyViewedMap();
  const key = getTermKey(year, semester);
  const existing = map[key] ?? [];

  // Remove if already exists
  const filtered = existing.filter(
    (item) =>
      !(
        item.subject === classData.subject &&
        item.courseNumber === classData.courseNumber &&
        item.number === classData.number
      )
  );

  // Add to front with current timestamp
  const newItem: RecentlyViewedClass = {
    ...classData,
    viewedAt: Date.now(),
  };

  filtered.unshift(newItem);

  // Keep only the most recent MAX_ITEMS_PER_TERM items
  map[key] = filtered.slice(0, MAX_ITEMS_PER_TERM);

  saveRecentlyViewedMap(map);
};

/**
 * Removes a specific class from recently viewed
 */
export const removeRecentlyViewed = (
  year: number,
  semester: Semester,
  classData: Pick<RecentlyViewedClass, "subject" | "courseNumber" | "number">
): void => {
  const map = getRecentlyViewedMap();
  const key = getTermKey(year, semester);
  const existing = map[key] ?? [];

  map[key] = existing.filter(
    (item) =>
      !(
        item.subject === classData.subject &&
        item.courseNumber === classData.courseNumber &&
        item.number === classData.number
      )
  );

  // Remove term key if empty
  if (map[key].length === 0) {
    delete map[key];
  }

  saveRecentlyViewedMap(map);
};

/**
 * Clears all recently viewed classes for a specific term
 */
export const clearRecentlyViewedForTerm = (
  year: number,
  semester: Semester
): void => {
  const map = getRecentlyViewedMap();
  const key = getTermKey(year, semester);
  delete map[key];
  saveRecentlyViewedMap(map);
};

/**
 * Clears all recently viewed classes across all terms
 */
export const clearAllRecentlyViewed = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear recently viewed classes:", error);
  }
};
