import { ITermItem } from "@repo/common/models";

import { Config } from "../shared/config";

/**
 * Warms the catalog cache for a single term by making a POST request to the backend.
 * Returns true if successful, false otherwise.
 */
const warmCacheForTerm = async (
  config: Config,
  term: Pick<ITermItem, "name">
): Promise<boolean> => {
  const { log, BACKEND_URL } = config;

  const [yearStr, semester] = term.name.split(" ");
  const year = parseInt(yearStr);

  if (!year || !semester) {
    log.warn(`Failed to parse term name: ${term.name}`);
    return false;
  }

  try {
    log.info(`Warming cache for ${term.name}...`);

    const response = await fetch(`${BACKEND_URL}/cache/warm-catalog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, semester }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.warn(
        `Failed to warm cache for ${term.name}: HTTP ${response.status} - ${errorText}`
      );
      return false;
    } else {
      const result = await response.json();
      log.info(`Warmed cache for ${term.name}: ${result.key}`);
      return true;
    }
  } catch (error: any) {
    log.warn(`Failed to warm cache for ${term.name}: ${error.message}`);
    return false;
  }
};

/**
 * Warms the catalog cache for the given terms by making POST requests to the backend.
 * Processes terms sequentially, one at a time.
 *
 * @param terms - Array of terms to warm cache for
 * @param log - Logger instance
 */
export const warmCatalogCacheForTerms = async (
  config: Config,
  terms: Pick<ITermItem, "name">[]
) => {
  const { log } = config;

  if (terms.length === 0) {
    log.info("No terms to warm cache for.");
    return;
  }

  log.info(`Warming catalog cache for ${terms.length} term(s)...`);

  let successCount = 0;
  for (const term of terms) {
    const success = await warmCacheForTerm(config, term);
    if (success) {
      successCount++;
    }
  }

  log.info(
    `Completed catalog cache warming: ${successCount}/${terms.length} succeeded`
  );
};
