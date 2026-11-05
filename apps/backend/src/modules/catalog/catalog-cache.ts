import { FuzzySearch } from "@repo/common";
import { CatalogClassModel, type ICatalogClassItem } from "@repo/common/models";

import { getFormerNamesByCourseId } from "../course/controller";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 5;

// Only the fields catalog search reads, so each cached term stays small:
// - result cards: fields requested by GetCatalogSearch
//   (apps/frontend/src/lib/api/catalog.ts); keep in sync with that query
// - fuzzy search keys and former names (getSearchIndex)
// - applyInMemoryFilters, matchesCoEHss and sortSearchResults (controller.ts)
const CATALOG_CACHE_PROJECTION = {
  // Result cards
  year: 1,
  semester: 1,
  sessionId: 1,
  subject: 1,
  courseNumber: 1,
  number: 1,
  title: 1,
  unitsMin: 1,
  unitsMax: 1,
  courseTitle: 1,
  allTimeAverageGrade: 1,
  allTimePassCount: 1,
  allTimeNoPassCount: 1,
  enrolledCount: 1,
  maxEnroll: 1,
  activeReservedMaxCount: 1,
  "aggregatedRatings.metrics": 1,
  "decal.title": 1,
  "meetings.days": 1,
  "meetings.startTime": 1,
  "meetings.endTime": 1,

  // Search
  courseId: 1,
  searchableNames: 1,
  courseDescription: 1,

  // Filters and sorting
  level: 1,
  academicOrganization: 1,
  gradingBasis: 1,
  primaryOnline: 1,
  breadthRequirements: 1,
  universityRequirements: 1,
  "sectionAttributes.attribute.code": 1,
  "sectionAttributes.value.code": 1,
  meetingDays: 1,
  meetingStartMinutes: 1,
  meetingEndMinutes: 1,
  enrollmentStatus: 1,
  waitlistedCount: 1,
  maxWaitlist: 1,
  openSeats: 1,
};

interface CatalogCacheEntry {
  data: ICatalogClassItem[];
  loadedAt: number;
}

const catalogCache = new Map<string, CatalogCacheEntry>();
const indexCache = new Map<string, FuzzySearch<ICatalogClassItem>>();

const evictOldest = () => {
  if (catalogCache.size <= MAX_CACHE_ENTRIES) return;

  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  for (const [key, entry] of catalogCache) {
    if (entry.loadedAt < oldestTime) {
      oldestTime = entry.loadedAt;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    catalogCache.delete(oldestKey);
    indexCache.delete(oldestKey);
  }
};

export const getCachedCatalog = async (
  year: number,
  semester: string
): Promise<ICatalogClassItem[]> => {
  const key = `${year}:${semester}`;
  const cached = catalogCache.get(key);
  const now = Date.now();

  if (cached && now - cached.loadedAt < CACHE_TTL) {
    return cached.data;
  }

  // Clear stale index when catalog is refreshed
  indexCache.delete(key);

  const data = await CatalogClassModel.find({ year, semester })
    .select(CATALOG_CACHE_PROJECTION)
    .lean();
  catalogCache.set(key, { data: data as ICatalogClassItem[], loadedAt: now });
  evictOldest();

  return data as ICatalogClassItem[];
};

export const getSearchIndex = async (
  year: number,
  semester: string
): Promise<FuzzySearch<ICatalogClassItem>> => {
  const key = `${year}:${semester}`;
  const cached = indexCache.get(key);

  // Index is valid as long as the underlying catalog is still cached and fresh
  const catalogEntry = catalogCache.get(key);
  if (
    cached &&
    catalogEntry &&
    Date.now() - catalogEntry.loadedAt < CACHE_TTL
  ) {
    return cached;
  }

  const data = await getCachedCatalog(year, semester);
  const formerNamesByCourseId = await getFormerNamesByCourseId();

  const indexedData = data.map((item) => {
    const formerNames = formerNamesByCourseId.get(item.courseId);
    if (!formerNames?.length) return item;

    const formerNameVariants = formerNames.flatMap((name) => [
      name,
      name.replace(/\s+/g, ""),
    ]);

    return {
      ...item,
      searchableNames: [...(item.searchableNames ?? []), ...formerNameVariants],
    };
  });

  const index = new FuzzySearch<ICatalogClassItem>(indexedData, {
    keys: [
      { name: "searchableNames", weight: 10 },
      { name: "courseTitle", weight: 2 },
      { name: "courseDescription", weight: 0.5 },
    ],
    threshold: 0.6,
    includeScore: true,
  });

  indexCache.set(key, index);
  return index;
};
