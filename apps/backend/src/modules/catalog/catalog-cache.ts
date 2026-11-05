import { parseTermName } from "@repo/common";
import {
  CatalogClassModel,
  EnrollmentPullModel,
  type ICatalogClassItem,
  TermModel,
} from "@repo/common/models";

import { getFormerNamesByCourseId } from "../course/controller";
import {
  type CatalogSearchIndex,
  buildCatalogSearchIndex,
  normalizeCatalogSearchQuery,
} from "./search-index";

// Hot terms are the ones the enrollments puller is updating: they stay cached
// and reload after each new pull. Other (cold) terms are dropped once idle.
// Stale entries keep being served while they refresh in the background, so
// requests never wait on a refresh.
const HOT_PULL_WINDOW = 60 * 60 * 1000; // pulled within the last hour
const HOT_TERMS_TTL = 60 * 1000; // re-check which terms are hot every minute
const MAX_DATA_AGE = 60 * 60 * 1000; // fallback refresh if the puller stops
const COLD_IDLE_TTL = 10 * 60 * 1000;
const MAX_COLD_TERMS = 2;
const SWEEP_INTERVAL = 60 * 1000;
// After a failed background refresh, keep serving stale data for this long
// before trying again
const REFRESH_RETRY_DELAY = 30 * 1000;
// Ranked hit lists for recent queries, shared across terms. Bounded by entry
// count and by the total number of hits held.
const MAX_CACHED_SEARCHES = 1000;
const MAX_CACHED_SEARCH_HITS = 1_000_000;

// Only the fields catalog search reads, so each cached term stays small:
// - result cards: fields requested by GetCatalogSearch
//   (apps/frontend/src/lib/api/catalog.ts); keep in sync with that query
// - fuzzy search keys and former names (search-index.ts)
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

interface TermEntry {
  data: ICatalogClassItem[];
  formerNamesByCourseId: Map<string, string[]>;
  loadedAt: number;
  // The term's lastPulledAt when this data was loaded, if the term was hot
  pulledAt: number | null;
  // Built on first search, since semantic search only needs data
  index: CatalogSearchIndex | null;
}

interface TermState {
  entry: TermEntry | null;
  // In-flight load, shared by all concurrent callers
  loading: Promise<TermEntry> | null;
  lastFailedAt: number;
  lastUsedAt: number;
}

interface CatalogCacheDeps {
  loadCatalog: (year: number, semester: string) => Promise<ICatalogClassItem[]>;
  loadFormerNames: () => Promise<Map<string, string[]>>;
  // "year:semester" -> lastPulledAt for each hot term
  loadHotTerms: () => Promise<Map<string, number>>;
  now: () => number;
  onRefreshError: (key: string, error: unknown) => void;
}

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
      result.set(`${term.year}:${term.semester}`, pull.lastPulledAt.getTime());
    }
  }
  return result;
};

const defaultDeps: CatalogCacheDeps = {
  loadCatalog: async (year, semester) =>
    (await CatalogClassModel.find({ year, semester })
      .select(CATALOG_CACHE_PROJECTION)
      .lean()) as ICatalogClassItem[],
  loadFormerNames: getFormerNamesByCourseId,
  loadHotTerms,
  now: Date.now,
  onRefreshError: (key, error) =>
    console.error(`[CatalogCache] Refresh of ${key} failed:`, error),
};

export const createCatalogCache = (
  overrides: Partial<CatalogCacheDeps> = {}
) => {
  const deps = { ...defaultDeps, ...overrides };

  const terms = new Map<string, TermState>();
  // Map iteration order doubles as least-recently-used order
  const searches = new Map<string, ICatalogClassItem[]>();
  let cachedSearchHits = 0;

  let hotTerms: {
    value: Promise<Map<string, number>>;
    loadedAt: number;
  } | null = null;

  // Never rejects: if the lookup fails, every term is treated as cold until
  // the next check
  const getHotTerms = () => {
    const now = deps.now();
    if (!hotTerms || now - hotTerms.loadedAt >= HOT_TERMS_TTL) {
      hotTerms = {
        loadedAt: now,
        value: deps.loadHotTerms().catch((error) => {
          console.error("[CatalogCache] Failed to load hot terms:", error);
          return new Map<string, number>();
        }),
      };
    }
    return hotTerms.value;
  };

  const touch = <K, V>(map: Map<K, V>, key: K, value: V) => {
    map.delete(key);
    map.set(key, value);
  };

  const deleteSearch = (searchKey: string) => {
    const hits = searches.get(searchKey);
    if (!hits) return;
    cachedSearchHits -= hits.length;
    searches.delete(searchKey);
  };

  const invalidateSearches = (termKey: string) => {
    for (const searchKey of [...searches.keys()]) {
      if (searchKey.startsWith(`${termKey}:`)) deleteSearch(searchKey);
    }
  };

  // Drop idle cold terms, then the least recently used cold terms until at
  // most maxCold remain. Hot terms are never evicted.
  const evictColdTerms = (hot: Map<string, number>, maxCold: number) => {
    const now = deps.now();
    const cold = [...terms]
      .filter(([termKey]) => !hot.has(termKey))
      .sort(([, a], [, b]) => a.lastUsedAt - b.lastUsedAt);

    let remaining = cold.length;
    for (const [termKey, state] of cold) {
      const idle = now - state.lastUsedAt >= COLD_IDLE_TTL;
      if (!idle && remaining <= maxCold) break;

      terms.delete(termKey);
      invalidateSearches(termKey);
      remaining--;
      console.log(
        `[CatalogCache] Evicted ${termKey} (${idle ? "idle" : "lru"})`
      );
    }
  };

  setInterval(() => {
    getHotTerms().then((hot) => evictColdTerms(hot, MAX_COLD_TERMS));
  }, SWEEP_INTERVAL).unref();

  const load = (
    termKey: string,
    state: TermState,
    hot: Map<string, number>,
    year: number,
    semester: string
  ) => {
    const startedAt = deps.now();
    console.log(
      `[CatalogCache] Loading ${termKey} (${state.entry ? "refresh" : "miss"})`
    );

    const loading = (async () => {
      const [data, formerNamesByCourseId] = await Promise.all([
        deps.loadCatalog(year, semester),
        deps.loadFormerNames(),
      ]);

      const entry: TermEntry = {
        data,
        formerNamesByCourseId,
        loadedAt: deps.now(),
        pulledAt: hot.get(termKey) ?? null,
        index: null,
      };

      // Evicted while loading: callers waiting on this load still get the
      // data, but don't bring the term back
      if (terms.get(termKey) !== state) return entry;

      // If searches were using the old index, build the new one before
      // swapping it in so that they don't have to wait for it
      if (state.entry?.index) {
        entry.index = buildCatalogSearchIndex(data, formerNamesByCourseId);
      }

      state.entry = entry;
      invalidateSearches(termKey);

      console.log(
        `[CatalogCache] Loaded ${termKey}: ${data.length} classes in ${deps.now() - startedAt}ms`
      );
      return entry;
    })();

    state.loading = loading;
    loading.then(
      () => {
        if (state.loading === loading) state.loading = null;
      },
      () => {
        if (state.loading === loading) state.loading = null;
        state.lastFailedAt = deps.now();
      }
    );

    return loading;
  };

  const getEntry = async (
    year: number,
    semester: string
  ): Promise<TermEntry> => {
    const termKey = `${year}:${semester}`;
    const hot = await getHotTerms();

    // Read the state after the await, so a load that finished meanwhile is
    // seen and not started again
    const now = deps.now();
    let state = terms.get(termKey);
    if (!state) {
      // Make room first, so a new cold term never pushes the cache over its cap
      if (!hot.has(termKey)) evictColdTerms(hot, MAX_COLD_TERMS - 1);

      state = {
        entry: null,
        loading: null,
        lastFailedAt: -Infinity,
        lastUsedAt: now,
      };
      terms.set(termKey, state);
    }
    state.lastUsedAt = now;

    const { entry } = state;
    if (!entry) {
      return state.loading ?? load(termKey, state, hot, year, semester);
    }

    // Serve the cached copy while one background load refreshes it after a
    // new enrollments pull, or once the data is too old
    const pulledAt = hot.get(termKey);
    const newPull = pulledAt !== undefined && pulledAt > (entry.pulledAt ?? 0);
    if (
      (newPull || now - entry.loadedAt >= MAX_DATA_AGE) &&
      !state.loading &&
      now - state.lastFailedAt >= REFRESH_RETRY_DELAY
    ) {
      load(termKey, state, hot, year, semester).catch((error) =>
        deps.onRefreshError(termKey, error)
      );
    }

    return entry;
  };

  const getCachedCatalog = async (
    year: number,
    semester: string
  ): Promise<ICatalogClassItem[]> => (await getEntry(year, semester)).data;

  /**
   * Ranked fuzzy search hits for a query, before any filtering, sorting or
   * pagination. The returned array is shared between callers: don't mutate it.
   */
  const searchCatalog = async (
    year: number,
    semester: string,
    query: string
  ): Promise<ICatalogClassItem[]> => {
    const entry = await getEntry(year, semester);

    // Nothing below awaits, so the entry can't be swapped out mid-search
    const termKey = `${year}:${semester}`;
    const normalizedQuery = normalizeCatalogSearchQuery(query);
    const searchKey = `${termKey}:${normalizedQuery}`;

    const cached = searches.get(searchKey);
    if (cached) {
      touch(searches, searchKey, cached);
      return cached;
    }

    entry.index ??= buildCatalogSearchIndex(
      entry.data,
      entry.formerNamesByCourseId
    );
    const hits = entry.index.search(normalizedQuery).map((r) => r.item);

    // Only cache hits for the term's current data, so that an evicted term
    // doesn't leave results behind
    if (
      terms.get(termKey)?.entry === entry &&
      hits.length <= MAX_CACHED_SEARCH_HITS
    ) {
      searches.set(searchKey, hits);
      cachedSearchHits += hits.length;
      for (const oldestKey of searches.keys()) {
        if (
          searches.size <= MAX_CACHED_SEARCHES &&
          cachedSearchHits <= MAX_CACHED_SEARCH_HITS
        ) {
          break;
        }
        deleteSearch(oldestKey);
      }
    }

    return hits;
  };

  return { getCachedCatalog, searchCatalog };
};

export const { getCachedCatalog, searchCatalog } = createCatalogCache();
