import { Logger } from "tslog";

export async function fetchPaginatedData<T, R>(
  logger: Logger<unknown>,
  api: any,
  termIds: string[] | null,
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
    let errorCount = 0;

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
            errorCount++;
            return [];
          })
      );
    }

    const batchResults = await Promise.all(promises);
    const flattenedResults = batchResults.flat();

    return [flattenedResults, errorCount] as const;
  };

  const processBatch = async (termId?: string) => {
    const [batchData, errorCount] = await fetchBatch(termId);
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

    return errorCount < queryBatchSize / 10; // allow 10% error rate
  };

  if (termIds && termIds.length > 0) {
    for (const termId of termIds) {
      logger.info(`Fetching for term ${termId}`);
      let hasMoreData = true;
      while (hasMoreData) {
        hasMoreData = await processBatch(termId);
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
