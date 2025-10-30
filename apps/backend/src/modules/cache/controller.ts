import type { ApolloServer } from "@apollo/server";
import { RedisClientType } from "redis";

import { GET_CANONICAL_CATALOG_QUERY } from "@repo/shared";

/**
 * Warms catalog cache using Apollo's executeOperation.
 *
 * Process:
 * 1. Executes GetCanonicalCatalog query with __warmStaging context flag
 * 2. Apollo caches response to staging key: apollo-cache:fqc:catalog:{year}-{semester}:staging
 * 3. Atomically RENAMEs staging → production key
 * 4. Users immediately see new data with zero downtime
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
): Promise<{ success: boolean; key: string }> {
  // Normalize semester: capitalize first letter for GraphQL enum
  const normalizedSemester =
    semester.charAt(0).toUpperCase() + semester.slice(1).toLowerCase();

  console.log(`[Cache] Warming catalog for ${year} ${normalizedSemester}...`);

  try {
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
          __warmStaging: true, // Signals generateCacheKey to use :staging suffix
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
    const stagingKey = `apollo-cache:fqc:catalog:${year}-${semester.toLowerCase()}:staging`;
    const productionKey = `apollo-cache:fqc:catalog:${year}-${semester.toLowerCase()}`;

    console.log(`[Cache] Swapping ${stagingKey} → ${productionKey}...`);

    try {
      await redis.rename(stagingKey, productionKey);
      console.log(`[Cache] Successfully warmed cache for ${year} ${semester}`);
    } catch (renameError: any) {
      // Handle case where staging key doesn't exist (shouldn't happen)
      if (renameError.message?.includes("no such key")) {
        throw new Error(
          `Staging key ${stagingKey} not found after executeOperation. Cache may not have been written.`
        );
      }
      throw renameError;
    }

    return {
      success: true,
      key: productionKey,
    };
  } catch (error) {
    console.error(`[Cache] Error warming ${year} ${semester}:`, error);
    throw error;
  }
}
