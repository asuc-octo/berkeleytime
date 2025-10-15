import { randomBytes } from "crypto";
import os from "os";
import type { RedisClientType } from "redis";

import { TermModel } from "@repo/common";

import {
  buildCatalogCacheKey,
  fetchCatalogData,
  storeCatalogInCache,
} from "./controller";

const JOB_INTERVAL_MS = 5 * 60 * 1000;
const LOCK_KEY = "locks:catalog-cache-refresh";
const LOCK_TTL_SECONDS = 240;

const INSTANCE_ID = `${os.hostname()}:${process.pid}:${randomBytes(6).toString(
  "hex"
)}`;

type ParsedTerm = {
  semester: string;
  year: number;
};

const parseTermName = (termName: string): ParsedTerm | null => {
  const match = termName.match(/^(\d{4})\s+(.+)$/);
  if (!match) return null;

  const [, rawYear, semester] = match;
  const year = Number.parseInt(rawYear, 10);

  if (!Number.isFinite(year) || !semester) return null;

  return { year, semester };
};

const acquireLock = async (redis: RedisClientType): Promise<boolean> => {
  try {
    const result = await redis.set(LOCK_KEY, INSTANCE_ID, {
      NX: true,
      EX: LOCK_TTL_SECONDS,
    });

    return result === "OK";
  } catch (error) {
    console.warn(
      `[CatalogCache][${INSTANCE_ID}] Failed to acquire refresh lock: ${String(
        error
      )}`
    );
    return false;
  }
};

const releaseLock = async (redis: RedisClientType): Promise<void> => {
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end`;

  try {
    await redis.eval(script, {
      keys: [LOCK_KEY],
      arguments: [INSTANCE_ID],
    });
  } catch (error) {
    console.warn(
      `[CatalogCache][${INSTANCE_ID}] Failed to release refresh lock: ${String(
        error
      )}`
    );
  }
};

const fetchActiveTerms = async (): Promise<ParsedTerm[]> => {
  const rawTerms = await TermModel.find({
    academicCareerCode: "UGRD",
    temporalPosition: { $in: ["Current", "Future"] },
  })
    .select({ name: 1 })
    .lean();

  const seen = new Map<string, ParsedTerm>();
  for (const term of rawTerms) {
    if (!term?.name) continue;

    const parsed = parseTermName(term.name);
    if (!parsed) continue;

    const key = `${parsed.year}-${parsed.semester}`;
    if (!seen.has(key)) {
      seen.set(key, parsed);
    }
  }

  return Array.from(seen.values());
};

const warmTermCacheForCatalogQuery = async (
  redis: RedisClientType,
  term: ParsedTerm
): Promise<void> => {
  const { year, semester } = term;
  const includesGradeDistribution = true; // matches GetCatalog usage

  try {
    const classes = await fetchCatalogData(
      year,
      semester,
      includesGradeDistribution
    );

    const cacheKey = buildCatalogCacheKey(
      year,
      semester,
      includesGradeDistribution
    );

    await storeCatalogInCache(redis, cacheKey, classes);

    console.info(
      `[CatalogCache][${INSTANCE_ID}] Warmed with-grade cache for ${semester} ${year}`
    );
  } catch (error) {
    console.warn(
      `[CatalogCache][${INSTANCE_ID}] Failed to warm with-grade cache for ${semester} ${year}: ${String(
        error
      )}`
    );
  }
};

const runRefresh = async (redis: RedisClientType): Promise<void> => {
  const acquired = await acquireLock(redis);
  if (!acquired) {
    return;
  }

  console.info(`[CatalogCache][${INSTANCE_ID}] Acquired refresh lock`);

  const start = Date.now();

  try {
    const terms = await fetchActiveTerms();
    if (terms.length === 0) {
      console.info(
        `[CatalogCache][${INSTANCE_ID}] No active terms found for catalog cache refresh`
      );
      return;
    }

    for (const term of terms) {
      await warmTermCacheForCatalogQuery(redis, term);
    }

    const elapsedMs = Date.now() - start;
    console.info(
      `[CatalogCache][${INSTANCE_ID}] Completed catalog cache refresh in ${elapsedMs}ms`
    );
  } catch (error) {
    console.warn(
      `[CatalogCache][${INSTANCE_ID}] Catalog cache refresh errored: ${String(
        error
      )}`
    );
  } finally {
    await releaseLock(redis);
  }
};

export const registerCatalogCacheRefresh = (redis: RedisClientType): void => {
  if (process.env.DISABLE_CATALOG_CACHE_REFRESH === "true") {
    console.info("[CatalogCache] Catalog cache refresh job disabled via env");
    return;
  }

  void runRefresh(redis);

  setInterval(() => {
    void runRefresh(redis);
  }, JOB_INTERVAL_MS);
};
