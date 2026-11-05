import { FuzzySearch, parseTermName } from "@repo/common";
import {
  CatalogClassModel,
  EnrollmentPullModel,
  type ICatalogClassItem,
  TermModel,
} from "@repo/common/models";

import { getFormerNamesByCourseId } from "../course/controller";

// Hot terms are the ones the enrollments puller is updating: they stay cached
// and reload after each new pull. Other (cold) terms are dropped once idle.
const HOT_PULL_WINDOW = 60 * 60 * 1000; // pulled within the last hour
const HOT_TERMS_TTL = 60 * 1000; // re-check which terms are hot every minute
const MAX_DATA_AGE = 60 * 60 * 1000; // fallback refresh if the puller stops
const COLD_IDLE_TTL = 10 * 60 * 1000;
const MAX_COLD_ENTRIES = 2;
const SWEEP_INTERVAL = 60 * 1000;
const REFRESH_RETRY_BASE_DELAY = 30 * 1000;
const REFRESH_RETRY_MAX_DELAY = 5 * 60 * 1000;

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
  lastUsedAt: number;
  // The term's catalogUpdatedAt when this data was loaded, or 0 if unavailable
  catalogUpdatedAt: number;
}

interface IndexCacheEntry {
  // The catalog data this index was built from; the index is stale once the
  // catalog entry holds different data
  source: ICatalogClassItem[];
  index: Promise<FuzzySearch<ICatalogClassItem>>;
}

interface RefreshRetryState {
  failures: number;
  nextRetryAt: number;
}

const catalogCache = new Map<string, CatalogCacheEntry>();
const indexCache = new Map<string, IndexCacheEntry>();
const refreshRetries = new Map<string, RefreshRetryState>();

// In-flight catalog loads, so concurrent requests share one Mongo query
// instead of each loading the whole term
const pendingLoads = new Map<string, Promise<ICatalogClassItem[]>>();

let hotTerms: { value: Promise<Map<string, number>>; loadedAt: number } | null =
  null;
let lastKnownHotTerms: Map<string, number> | null = null;

const loadHotTerms = async () => {
  const pulls = await EnrollmentPullModel.find({
    lastPulledAt: { $gte: new Date(Date.now() - HOT_PULL_WINDOW) },
  }).lean();
  if (pulls.length === 0) return new Map<string, number>();

  const terms = await TermModel.find({
    id: { $in: pulls.map((pull) => pull.termId) },
  })
    .select({ id: 1, name: 1 })
    .lean();
  const nameById = new Map(terms.map((term) => [term.id, term.name]));

  const result = new Map<string, number>();
  for (const pull of pulls) {
    const term = parseTermName(nameById.get(pull.termId) ?? "");
    if (term) {
      result.set(
        `${term.year}:${term.semester}`,
        pull.catalogUpdatedAt?.getTime() ?? 0
      );
    }
  }
  return result;
};

// Terms are hot when lastPulledAt is recent; each value carries the completed
// catalog-update timestamp used to trigger a safe refresh. Never rejects: if
// the lookup fails, preserve the last known hot terms instead of evicting them.
const getHotTerms = () => {
  if (!hotTerms || Date.now() - hotTerms.loadedAt >= HOT_TERMS_TTL) {
    hotTerms = {
      loadedAt: Date.now(),
      value: loadHotTerms()
        .then((loaded) => {
          lastKnownHotTerms = loaded;
          return loaded;
        })
        .catch((error) => {
          console.error("[CatalogCache] Failed to load hot terms:", error);
          if (lastKnownHotTerms) return lastKnownHotTerms;

          // Before the first successful lookup, conservatively retain existing
          // entries.
          return new Map(
            [...catalogCache].map(
              ([key, entry]) => [key, entry.catalogUpdatedAt] as const
            )
          );
        }),
    };
  }
  return hotTerms.value;
};

const removeEntry = (key: string, reason: "idle" | "lru") => {
  catalogCache.delete(key);
  indexCache.delete(key);
  refreshRetries.delete(key);
  console.log(`[CatalogCache] Evicted ${key} (${reason})`);
};

// Drop idle cold terms, then the least recently used cold terms until at most
// maxCold remain. Hot terms are never evicted.
const evictColdEntries = (hot: Map<string, number>, maxCold: number) => {
  const now = Date.now();
  const cold = [...catalogCache]
    .filter(([key]) => !hot.has(key))
    .sort(([, a], [, b]) => a.lastUsedAt - b.lastUsedAt);

  for (const [key, entry] of cold) {
    if (now - entry.lastUsedAt >= COLD_IDLE_TTL) removeEntry(key, "idle");
  }

  const remaining = cold.filter(([key]) => catalogCache.has(key));
  while (remaining.length > maxCold) {
    removeEntry(remaining.shift()![0], "lru");
  }
};

setInterval(() => {
  getHotTerms().then((hot) => evictColdEntries(hot, MAX_COLD_ENTRIES));
}, SWEEP_INTERVAL).unref();

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
      const hot = await getHotTerms();

      // Make room first, so a new cold term never pushes the cache over its cap
      if (!hot.has(key) && !catalogCache.has(key)) {
        evictColdEntries(hot, MAX_COLD_ENTRIES - 1);
      }

      const data = (await CatalogClassModel.find({ year, semester })
        .select(CATALOG_CACHE_PROJECTION)
        .lean()) as ICatalogClassItem[];

      const previous = catalogCache.get(key);
      // Evicted while refreshing; don't bring it back
      if (reason === "refresh" && !previous) return data;

      const now = Date.now();
      catalogCache.set(key, {
        data,
        loadedAt: now,
        lastUsedAt: previous?.lastUsedAt ?? now,
        catalogUpdatedAt: hot.get(key) ?? 0,
      });
      // Delete the existing index which references previous catalog array.
      indexCache.delete(key);
      refreshRetries.delete(key);

      // Concurrent cold misses can all pass the pre-load capacity check.
      // Enforce the cap again after insertion so only the most recent remain.
      if (!hot.has(key)) evictColdEntries(hot, MAX_COLD_ENTRIES);

      console.log(
        `[CatalogCache] Loaded ${key}: ${data.length} classes in ${Date.now() - startedAt}ms`
      );
      return data;
    } catch (error) {
      if (reason === "refresh") {
        const failures = (refreshRetries.get(key)?.failures ?? 0) + 1;
        const delay = Math.min(
          REFRESH_RETRY_BASE_DELAY * 2 ** (failures - 1),
          REFRESH_RETRY_MAX_DELAY
        );
        refreshRetries.set(key, {
          failures,
          nextRetryAt: Date.now() + delay,
        });
        console.error(
          `[CatalogCache] Refresh of ${key} failed; retrying in ${delay}ms:`,
          error
        );
      }
      throw error;
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
  const hot = await getHotTerms();

  // Read the entry after the await, so a refresh that finished meanwhile is
  // seen and not started again
  const cached = catalogCache.get(key);
  if (!cached) return loadCatalog(key, year, semester, "miss");

  cached.lastUsedAt = Date.now();

  // Serve the cached copy while a single background load refreshes it after
  // catalog denormalization completes, or once the data is too old.
  const catalogUpdatedAt = hot.get(key);
  const catalogChanged =
    catalogUpdatedAt !== undefined &&
    catalogUpdatedAt > cached.catalogUpdatedAt;
  const refreshNeeded =
    catalogChanged || Date.now() - cached.loadedAt >= MAX_DATA_AGE;
  const retry = refreshRetries.get(key);
  if (refreshNeeded && (!retry || Date.now() >= retry.nextRetryAt)) {
    // loadCatalog records and logs refresh failures once per shared load.
    loadCatalog(key, year, semester, "refresh").catch(() => undefined);
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
