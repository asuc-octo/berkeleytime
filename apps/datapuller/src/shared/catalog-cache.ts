import type { Logger } from "tslog";

import { ITermItem } from "@repo/common";

const REFRESH_CATALOG_QUERY = `
  query RefreshCatalog($year: Int!, $semester: Semester!, $refresh: Boolean) {
    catalog(year: $year, semester: $semester, refresh: $refresh) {
      course {
        subject
        number
        gradeDistribution {
          average
        }
      }
      gradeDistribution {
        average
      }
    }
  }
`;

interface RefreshCatalogCacheOptions {
  graphqlEndpoint: string;
  log: Logger<unknown>;
  terms: ITermItem[];
}

export const refreshCatalogCache = async ({
  graphqlEndpoint,
  log,
  terms,
}: RefreshCatalogCacheOptions) => {
  if (!graphqlEndpoint) {
    log.warn("Catalog cache refresh skipped: missing GraphQL endpoint.");
    return;
  }

  const logger = log.getSubLogger({ name: "CatalogCacheRefresh" });

  const termMap = terms.reduce((accumulator, term) => {
    const match = term.name.match(/^(\d{4})\s+(.+)$/);
    if (!match) return accumulator;

    const [, yearString, semester] = match;
    const year = Number.parseInt(yearString, 10);
    if (!Number.isFinite(year) || !semester) return accumulator;

    const key = `${year}-${semester}`;
    if (!accumulator.has(key)) {
      accumulator.set(key, { year, semester });
    }

    return accumulator;
  }, new Map<string, { year: number; semester: string }>());

  if (termMap.size === 0) {
    logger.info("No catalog terms identified for cache refresh.");
    return;
  }

  logger.info(
    `Refreshing catalog cache for ${Array.from(termMap.values())
      .map(({ semester, year }) => `${semester} ${year}`)
      .join(", ")}`
  );

  for (const { year, semester } of termMap.values()) {
    try {
      const response = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: REFRESH_CATALOG_QUERY,
          variables: {
            year,
            semester,
            refresh: true,
          },
        }),
      });

      const payload =
        (await response.json().catch(() => null)) ??
        ({} as Record<string, unknown>);

      if (
        !response.ok ||
        (typeof payload === "object" &&
          payload !== null &&
          "errors" in payload &&
          Array.isArray((payload as { errors: unknown }).errors))
      ) {
        logger.warn(
          `Failed to refresh catalog cache for ${semester} ${year}: ${
            (payload as { errors?: unknown[] }).errors
              ? JSON.stringify((payload as { errors?: unknown[] }).errors)
              : response.statusText
          }`
        );
        continue;
      }

      logger.info(`Refreshed catalog cache for ${semester} ${year}`);
    } catch (error) {
      logger.warn(
        `Error refreshing catalog cache for ${semester} ${year}: ${String(error)}`
      );
    }
  }
};
