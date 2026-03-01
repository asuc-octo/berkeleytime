import { ITermItem } from "@repo/common/models";

import { Config } from "../shared/config";

const WARM_REQUEST_TIMEOUT_MS = 15_000;
const MAX_WARM_ATTEMPTS = 4;
const BASE_RETRY_DELAY_MS = 1_000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const getRetryDelayMs = (attempt: number) => {
  const exponentialDelay = BASE_RETRY_DELAY_MS * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 400);
  return exponentialDelay + jitter;
};

const isRetriableStatus = (status: number) =>
  status === 408 || status === 429 || status >= 500;

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
  const year = parseInt(yearStr, 10);

  if (!year || !semester) {
    log.warn(`Failed to parse term name: ${term.name}`);
    return false;
  }

  log.info(`Warming cache for ${term.name}...`);

  for (let attempt = 1; attempt <= MAX_WARM_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, WARM_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${BACKEND_URL}/cache/warm-catalog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, semester }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const result = (await response.json()) as {
          key?: string;
          state?: string;
        };
        const keyLabel = result.key ? `: ${result.key}` : "";
        const stateLabel = result.state ? ` (${result.state})` : "";
        log.info(`Warmed cache for ${term.name}${stateLabel}${keyLabel}`);
        return true;
      }

      const errorText = await response.text();
      const shouldRetry =
        isRetriableStatus(response.status) && attempt < MAX_WARM_ATTEMPTS;

      if (!shouldRetry) {
        log.warn(
          `Failed to warm cache for ${term.name}: HTTP ${response.status} - ${errorText}`
        );
        return false;
      }

      const retryDelayMs = getRetryDelayMs(attempt);
      log.warn(
        `Warm attempt ${attempt}/${MAX_WARM_ATTEMPTS} for ${term.name} failed with HTTP ${response.status}. Retrying in ${retryDelayMs}ms. Response: ${errorText}`
      );
      await sleep(retryDelayMs);
      continue;
    } catch (error: unknown) {
      clearTimeout(timeout);
      const message = error instanceof Error ? error.message : String(error);
      const shouldRetry = attempt < MAX_WARM_ATTEMPTS;

      if (!shouldRetry) {
        log.warn(
          `Failed to warm cache for ${term.name} after ${attempt} attempt(s): ${message}`
        );
        return false;
      }

      const retryDelayMs = getRetryDelayMs(attempt);
      log.warn(
        `Warm attempt ${attempt}/${MAX_WARM_ATTEMPTS} for ${term.name} failed: ${message}. Retrying in ${retryDelayMs}ms.`
      );
      await sleep(retryDelayMs);
      continue;
    }
  }

  return false;
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
