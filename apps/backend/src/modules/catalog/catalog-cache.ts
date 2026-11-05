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

interface IndexCacheEntry {
  // The catalog data this index was built from; the index is stale once the
  // catalog entry holds different data
  source: ICatalogClassItem[];
  index: Promise<FuzzySearch<ICatalogClassItem>>;
}

const catalogCache = new Map<string, CatalogCacheEntry>();
const indexCache = new Map<string, IndexCacheEntry>();

// In-flight catalog loads, so concurrent requests share one Mongo query
// instead of each loading the whole term
const pendingLoads = new Map<string, Promise<ICatalogClassItem[]>>();

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

const loadCatalog = (
  key: string,
  year: number,
  semester: string,
  reason: "miss" | "refresh"
): Promise<ICatalogClassItem[]> => {
  const pending = pendingLoads.get(key);
  if (pending) return pending;

  const startedAt = Date.now();
  console.log(`[CatalogCache] Loading ${key} (${reason})`);

  const load = (async () => {
    try {
      const data = (await CatalogClassModel.find({ year, semester })
        .select(CATALOG_CACHE_PROJECTION)
        .lean()) as ICatalogClassItem[];

      catalogCache.set(key, { data, loadedAt: Date.now() });
      evictOldest();

      console.log(
        `[CatalogCache] Loaded ${key}: ${data.length} classes in ${Date.now() - startedAt}ms`
      );
      return data;
    } finally {
      pendingLoads.delete(key);
    }
  })();

  pendingLoads.set(key, load);
  return load;
};

export const getCachedCatalog = async (
  year: number,
  semester: string
): Promise<ICatalogClassItem[]> => {
  const key = `${year}:${semester}`;
  const cached = catalogCache.get(key);

  if (!cached) return loadCatalog(key, year, semester, "miss");

  // Serve the stale copy while a single background load refreshes it
  if (Date.now() - cached.loadedAt >= CACHE_TTL) {
    loadCatalog(key, year, semester, "refresh").catch((error) => {
      console.error(`[CatalogCache] Refresh of ${key} failed:`, error);
    });
  }

  return cached.data;
};

const buildSearchIndex = async (data: ICatalogClassItem[]) => {
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

  return new FuzzySearch<ICatalogClassItem>(indexedData, {
    keys: [
      { name: "searchableNames", weight: 10 },
      { name: "courseTitle", weight: 2 },
      { name: "courseDescription", weight: 0.5 },
    ],
    threshold: 0.6,
    includeScore: true,
  });
};

export const getSearchIndex = async (
  year: number,
  semester: string
): Promise<FuzzySearch<ICatalogClassItem>> => {
  const key = `${year}:${semester}`;
  const data = await getCachedCatalog(year, semester);

  // Reuse the index (or the in-progress build) for this exact catalog data
  const cached = indexCache.get(key);
  if (cached && cached.source === data) return cached.index;

  const index = buildSearchIndex(data);

  // Only cache it if this data is still the cached catalog for the term
  if (catalogCache.get(key)?.data === data) {
    indexCache.set(key, { source: data, index });
    index.catch(() => {
      if (indexCache.get(key)?.index === index) indexCache.delete(key);
    });
  }

  return index;
};
