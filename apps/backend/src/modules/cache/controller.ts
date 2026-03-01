import type { ApolloServer } from "@apollo/server";
import { randomUUID } from "crypto";
import { RedisClientType } from "redis";

import { GET_CANONICAL_CATALOG_QUERY } from "@repo/shared";

const WARM_LOCK_TTL_SECONDS = 600;
const LAST_SUCCESS_TTL_SECONDS = 14 * 24 * 60 * 60;

type WarmCatalogCacheResult = {
  success: boolean;
  key: string;
  state: "promoted" | "skipped";
  lockAcquired: boolean;
  durationMs: number;
  metadataKey?: string;
};

/**
 * Warms catalog cache using Apollo's executeOperation.
 *
 * Process:
 * 1. Acquires a per-term distributed lock to avoid concurrent warm collisions
 * 2. Executes GetCanonicalCatalog with a unique staging suffix
 * 3. Atomically RENAMEs run-specific staging → production key
 * 4. Persists last-success metadata for observability
 *
 * @param server - Apollo server instance for executing GraphQL operations
 * @param redis - Redis client for atomic RENAME operation
 * @param year - Academic year (e.g., 2025)
 * @param semester - Semester name, case-insensitive (e.g., "fall", "Fall")
 */
export async function warmCatalogCache(
  server: ApolloServer,
  redis: RedisClientType,
  year: number,
  semester: string
): Promise<WarmCatalogCacheResult> {
  const startedAt = Date.now();
  // Normalize semester: capitalize first letter for GraphQL enum
  const normalizedSemester =
    semester.charAt(0).toUpperCase() + semester.slice(1).toLowerCase();
  const semesterToken = normalizedSemester.toLowerCase();
  const productionKey = `apollo-cache:fqc:catalog:${year}-${semesterToken}`;
  const lockKey = `cache-warm:catalog:${year}-${semesterToken}:lock`;
  const lockToken = randomUUID();

  console.log(`[Cache] Warming catalog for ${year} ${normalizedSemester}...`);

  const lockAcquired = await redis.set(lockKey, lockToken, {
    NX: true,
    EX: WARM_LOCK_TTL_SECONDS,
  });

  if (!lockAcquired) {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[Cache] Skipping warm for ${year} ${normalizedSemester}; another warm is already in progress.`
    );
    return {
      success: true,
      key: productionKey,
      state: "skipped",
      lockAcquired: false,
      durationMs,
    };
  }

  try {
    const warmRunId = randomUUID().replace(/-/g, "");
    const stagingKey = `apollo-cache:fqc:catalog:${year}-${semesterToken}:staging:${warmRunId}`;

    // Execute GraphQL query with staging flag
    const result = await server.executeOperation(
      {
        query: GET_CANONICAL_CATALOG_QUERY,
        variables: {
          year,
          semester: normalizedSemester,
        },
      },
      {
        contextValue: {
          // Signals generateCacheKey to use run-scoped staging key.
          __warmSuffix: warmRunId,
        },
      }
    );

    // Check for GraphQL errors
    if (result.body.kind === "single" && result.body.singleResult.errors) {
      throw new Error(
        `GraphQL errors: ${JSON.stringify(result.body.singleResult.errors)}`
      );
    }

    // Atomic RENAME: staging → production
    console.log(`[Cache] Swapping ${stagingKey} → ${productionKey}...`);

    try {
      await redis.rename(stagingKey, productionKey);
      const durationMs = Date.now() - startedAt;
      const metadataKey = `cache-warm:catalog:last-success:${year}-${semesterToken}`;
      await redis.set(
        metadataKey,
        JSON.stringify({
          year,
          semester: semesterToken,
          warmedAt: new Date().toISOString(),
          durationMs,
          productionKey,
          warmRunId,
        }),
        { EX: LAST_SUCCESS_TTL_SECONDS }
      );
      console.log(
        `[Cache] Successfully warmed cache for ${year} ${normalizedSemester} in ${durationMs}ms`
      );
      return {
        success: true,
        key: productionKey,
        state: "promoted",
        lockAcquired: true,
        durationMs,
        metadataKey,
      };
    } catch (renameError: unknown) {
      // Handle case where staging key doesn't exist (shouldn't happen)
      if (
        renameError instanceof Error &&
        renameError.message?.includes("no such key")
      ) {
        throw new Error(
          `Staging key ${stagingKey} not found after executeOperation. Cache may not have been written.`
        );
      }
      throw renameError;
    }
  } catch (error) {
    console.error(`[Cache] Error warming ${year} ${semester}:`, error);
    throw error;
  } finally {
    try {
      const currentLockToken = await redis.get(lockKey);
      if (currentLockToken === lockToken) {
        await redis.del(lockKey);
      }
    } catch (lockReleaseError) {
      console.warn(
        `[Cache] Failed to release lock ${lockKey}:`,
        lockReleaseError
      );
    }
  }
}
