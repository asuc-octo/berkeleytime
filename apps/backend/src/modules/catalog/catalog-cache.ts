import { CatalogClassModel, type ICatalogClassItem } from "@repo/common/models";

import { getFormerNamesByCourseId } from "../course/controller";
import {
  type CatalogSearchIndex,
  buildCatalogSearchIndex,
  normalizeCatalogSearchQuery,
} from "./search-index";

// The enrollments datapuller rewrites catalog rows every 15 minutes. Stale
// entries keep being served while they refresh in the background, so this only
// bounds staleness; requests never wait on a refresh.
const CACHE_TTL = 10 * 60 * 1000;
// After a failed background refresh, keep serving stale data for this long
// before trying again
const REFRESH_RETRY_DELAY = 30 * 1000;
const MAX_CACHED_TERMS = 5;
// Ranked hit lists for recent queries, shared across terms. Bounded by entry
// count and by the total number of hits held.
const MAX_CACHED_SEARCHES = 1000;
const MAX_CACHED_SEARCH_HITS = 1_000_000;

interface TermEntry {
  data: ICatalogClassItem[];
  formerNamesByCourseId: Map<string, string[]>;
  loadedAt: number;
  // Built on first search, since semantic search only needs data
  index: CatalogSearchIndex | null;
}

interface TermState {
  entry: TermEntry | null;
  // In-flight load, shared by all concurrent callers
  loading: Promise<TermEntry> | null;
  lastFailedAt: number;
}

interface CatalogCacheDeps {
  loadCatalog: (year: number, semester: string) => Promise<ICatalogClassItem[]>;
  loadFormerNames: () => Promise<Map<string, string[]>>;
  now: () => number;
  onRefreshError: (key: string, error: unknown) => void;
}

const defaultDeps: CatalogCacheDeps = {
  loadCatalog: async (year, semester) =>
    (await CatalogClassModel.find({
      year,
      semester,
    }).lean()) as ICatalogClassItem[],
  loadFormerNames: getFormerNamesByCourseId,
  now: Date.now,
  onRefreshError: (key, error) =>
    console.error(`Failed to refresh catalog cache for ${key}`, error),
};

export const createCatalogCache = (
  overrides: Partial<CatalogCacheDeps> = {}
) => {
  const deps = { ...defaultDeps, ...overrides };

  // Map iteration order doubles as least-recently-used order
  const terms = new Map<string, TermState>();
  const searches = new Map<string, ICatalogClassItem[]>();
  let cachedSearchHits = 0;

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

  const evictTerms = () => {
    for (const termKey of terms.keys()) {
      if (terms.size <= MAX_CACHED_TERMS) break;
      terms.delete(termKey);
      invalidateSearches(termKey);
    }
  };

  const load = (
    termKey: string,
    state: TermState,
    year: number,
    semester: string
  ) => {
    const loading = (async () => {
      const [data, formerNamesByCourseId] = await Promise.all([
        deps.loadCatalog(year, semester),
        deps.loadFormerNames(),
      ]);

      const entry: TermEntry = {
        data,
        formerNamesByCourseId,
        loadedAt: deps.now(),
        // If searches were using the old index, build the new one before
        // swapping it in so that they don't have to wait for it
        index: state.entry?.index
          ? buildCatalogSearchIndex(data, formerNamesByCourseId)
          : null,
      };

      state.entry = entry;
      invalidateSearches(termKey);
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

    let state = terms.get(termKey);
    if (!state) {
      state = { entry: null, loading: null, lastFailedAt: -Infinity };
    }
    touch(terms, termKey, state);
    evictTerms();

    const { entry } = state;
    if (!entry) return state.loading ?? load(termKey, state, year, semester);

    const now = deps.now();
    if (
      now - entry.loadedAt >= CACHE_TTL &&
      !state.loading &&
      now - state.lastFailedAt >= REFRESH_RETRY_DELAY
    ) {
      // Stale-while-revalidate
      load(termKey, state, year, semester).catch((error) =>
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
    const normalizedQuery = normalizeCatalogSearchQuery(query);
    const searchKey = `${year}:${semester}:${normalizedQuery}`;

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

    if (hits.length <= MAX_CACHED_SEARCH_HITS) {
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
