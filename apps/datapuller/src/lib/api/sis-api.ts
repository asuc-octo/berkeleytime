import { Logger } from "tslog";

export async function fetchPaginatedData<T, R>(
  logger: Logger<unknown>,
  api: any,
  terms: string[] | null,
  method: string,
  headers: Record<string, string>,
  responseProcessor: (data: any) => R[],
  itemFilter: (item: R) => boolean,
  itemProcessor: (item: R) => T
): Promise<T[]> {
  const results: T[] = [];
  const queryBatchSize = 50;
  let page = 1;
  let totalErrorCount = 0;

  const fetchBatch = async (termId?: string) => {
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
            logger.warn(`Error fetching page ${page + i}: ${error.message}`);
            return [];
          })
      );
    }

    const batchResults = await Promise.all(promises);
    const flattenedResults = batchResults.flat();

    return flattenedResults;
  };

  const processBatch = async (termId?: string) => {
    const batchData = await fetchBatch(termId);
    if (batchData.length === 0) return false;

    const transformedData = batchData.reduce((acc, item, index) => {
      try {
        if (itemFilter(item)) {
          const processedItem = itemProcessor(item);
          acc.push(processedItem);
        }
      } catch (error: any) {
        totalErrorCount++;
        logger.error(`Error processing item at index ${index}:`, error);
        logger.error("Problematic item:", JSON.stringify(item, null, 2));
      }
      return acc;
    }, [] as T[]);

    results.push(...transformedData);
    page += queryBatchSize;
    return true;
  };

  if (terms && terms.length > 0) {
    for (const term of terms) {
      logger.info(`Fetching for term ${term}`);
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

  logger.warn(`Total errors encountered: ${totalErrorCount}`);

  return results;
}
