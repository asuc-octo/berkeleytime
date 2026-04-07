import { FuzzySearch } from "@repo/common";
import { CatalogClassModel, type ICatalogClassItem } from "@repo/common/models";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 5;

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

const getCachedCatalog = async (
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

  const data = await CatalogClassModel.find({ year, semester }).lean();
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

  const index = new FuzzySearch<ICatalogClassItem>(data, {
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
