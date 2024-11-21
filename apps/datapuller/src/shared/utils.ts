import fs from "fs/promises";
import path from "path";
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
  terms: string[] | null,
  method: string,
  headers: Record<string, string>,
  responseProcessor: (data: any) => R[],
  itemProcessor: (item: R) => T,
  dataType: string // Add this parameter to specify the type of data being processed
): Promise<T[]> {
  const results: T[] = [];
  const queryBatchSize = 50;
  let page = 1;
  let totalErrorCount = 0;

  const fetchBatch = async (termId?: string) => {
    //logger.info(`Querying ${queryBatchSize} pages from page ${page}...`);
    const promises = [];

    for (let i = 0; i < queryBatchSize; i++) {
      const params: Record<string, any> = {
        "page-number": (page + i).toString(),
        "page-size": "50",
      };
      if (termId) {
        params["term-id"] = termId;
      }

      promises.push(
        api[method](params, { headers })
          .then((response: any) => response.json())
          .then((data: any) => responseProcessor(data))
          .catch((error: any) => {
            logger.error(`Error fetching page ${page + i}: ${error.message}`);
            return [];
          })
      );
    }

    const batchResults = await Promise.all(promises);
    const flattenedResults = batchResults.flat();

    //logger.info(`Processed ${flattenedResults.length} items in this batch.`);

    return flattenedResults;
  };

  const processBatch = async (termId?: string) => {
    const batchData = await fetchBatch(termId);
    if (batchData.length === 0) return false;

    let batchErrorCount = 0;
    const transformedData = batchData.reduce((acc, item, index) => {
      try {
        const processedItem = itemProcessor(item);
        acc.push(processedItem);
      } catch (error) {
        batchErrorCount++;
        logger.error(`Error processing item at index ${index}:`, error);
        logger.error("Problematic item:", JSON.stringify(item, null, 2));
      }
      return acc;
    }, [] as T[]);

    totalErrorCount += batchErrorCount;
    //logger.info(`Processed ${transformedData.length} items in this batch.`);
    //logger.info(`Errors in this batch: ${batchErrorCount}`);

    results.push(...transformedData);
    page += queryBatchSize;
    return true;
  };

  if (terms && terms.length > 0) {
    for (const term of terms) {
      let hasMoreData = true;
      while (hasMoreData) {
        hasMoreData = await processBatch(term);
      }
      page = 1;
    }
  } else {
    let hasMoreData = true;
    while (hasMoreData) {
      hasMoreData = await processBatch();
    }
  }

  logger.info(`Total errors encountered for ${dataType}: ${totalErrorCount}`);

  // Log totalErrorCount to a file
  const logDir = path.join(__dirname, "logs");
  const logFile = path.join(logDir, "error_counts.log");
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${dataType} - ${method} - Total errors: ${totalErrorCount}\n`;

  try {
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, logMessage);
    logger.info(`Error count for ${dataType} logged to ${logFile}`);
  } catch (error) {
    logger.error(`Failed to log error count for ${dataType} to file: ${error}`);
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
