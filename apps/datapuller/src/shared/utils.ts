import { Logger } from "tslog";

import { Term, TermsAPI } from "@repo/sis-api/terms";

type TemporalPosition = "" | "Previous" | "Current" | "Next";

export async function fetchActiveTerms(
  logger: Logger<unknown>,
  headers: Record<string, string>
): Promise<string[]> {
  const termsAPI = new TermsAPI();
  const activeTermIds: string[] = [];

  const currentTerms: TemporalPosition[] = ["Current", "Next"];

  for (const term of currentTerms) {
    try {
      logger.info(`Fetching ${term} terms`);
      const response = await termsAPI.v2.getByTermsUsingGet(
        {
          "temporal-position": term,
        },
        {
          headers,
        }
      );

      const data = await response.json();
      activeTermIds.push(...data.response.terms.map((term: Term) => term.id));
    } catch (error) {
      logger.error(`Unexpected error querying API. Error: "${error}"`);
    }
  }
  const uniqueActiveTermIds = Array.from(new Set(activeTermIds));

  logger.info(`Fetched ${uniqueActiveTermIds.length} unique active term IDs`);

  return uniqueActiveTermIds;
}

export async function fetchPaginatedData<T, R>(
  logger: Logger<unknown>,
  api: any,
  terms: string[],
  method: string,
  headers: Record<string, string>,
  responseProcessor: (data: any) => R[],
  itemProcessor: (item: R) => T
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let retries = 1;

  for (const term of terms) {
    while (retries > 0) {
      try {
        const response = await api[method](
          {
            "term-id": term,
            "page-number": page,
            "page-size": 100,
          },
          { headers }
        );

        const data = await response.json();
        const processedData = responseProcessor(data);

        if (processedData.length === 0) {
          break; // No more data to fetch
        }
        logger.info("Mapping processedData with itemProcessor...");
        const transformedData = processedData.map((item, index) => {
          try {
            return itemProcessor(item);
          } catch (error) {
            logger.error(`Error processing item at index ${index}:`, error);
            logger.error("Problematic item:", JSON.stringify(item, null, 2));
            throw error;
          }
        });

        results.push(...transformedData);
        logger.info("result", transformedData);
        logger.info(
          `Processed ${processedData.length} items from page ${page}.`
        );
        page++;
        retries = 1;
      } catch (error) {
        logger.error(`Error fetching page ${page} of data`);
        logger.error(`Unexpected error querying API. Error: "${error}"`);

        if (retries === 0) {
          logger.error(`Too many errors querying API. Terminating update...`);
          break;
        }

        retries--;
        logger.info(`Retrying...`);
      }
    }
  }

  return results;
}

export function getRequiredField<T>(
  value: T | undefined,
  fieldName: string,
  defaultValue: T
): T {
  if (value === undefined || value === null) {
    // TODO: Maybe add back?
    console.warn(`Missing required field: ${fieldName}`);
    return defaultValue;
  }
  return value;
}
