import { FuzzySearch } from "@repo/common";
import { CatalogClassModel, type ICatalogClassItem } from "@repo/common/models";

import { getFormerNamesByCourseId } from "../course/controller";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 5;

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
      const data = (await CatalogClassModel.find({
        year,
        semester,
      }).lean()) as ICatalogClassItem[];

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
