import fs from "fs/promises";
import path from "path";
import { Logger } from "tslog";

export async function fetchPaginatedData<T, R>(
  logger: Logger<unknown>,
  api: any,
  terms: string[] | null,
  method: string,
  headers: Record<string, string>,
  responseProcessor: (data: any) => R[],
  itemProcessor: (item: R) => T,
  dataType: string
): Promise<T[]> {
  const results: T[] = [];
  const queryBatchSize = 50;
  let page = 1;
  let totalErrorCount = 0;

  // Get the current date to include in the log file name
  const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Set up the error log file path based on dataType and date
  const logDir = path.join(__dirname, "logs");
  const errorLogFile = path.join(
    logDir,
    `error_${dataType}_${currentDate}.log`
  );

  // Ensure the log directory exists
  await fs.mkdir(logDir, { recursive: true });

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
            logger.error(`Error fetching page ${page + i}: ${error.message}`);
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

    let batchErrorCount = 0;

    const transformedData = batchData.reduce((acc, item, index) => {
      try {
        const processedItem = itemProcessor(item);
        acc.push(processedItem);
      } catch (error: any) {
        batchErrorCount++;
        totalErrorCount++;
        logger.error(`Error processing item at index ${index}:`, error);
        logger.error("Problematic item:", JSON.stringify(item, null, 2));

        // Log detailed error to the error file
        const timestamp = new Date().toISOString();
        const errorMessage = `${timestamp} - Error processing item at index ${index}: ${error.message}\n`;
        const itemData = `Item data: ${JSON.stringify(item, null, 2)}\n\n`;

        fs.appendFile(errorLogFile, errorMessage + itemData).catch(
          (fsError) => {
            logger.error(
              `Failed to write to error log file: ${fsError.message}`
            );
          }
        );
      }
      return acc;
    }, [] as T[]);

    if (batchErrorCount > 0) {
      const batchErrorMessage = `${new Date().toISOString()} - Batch error count: ${batchErrorCount}\n`;
      await fs.appendFile(errorLogFile, batchErrorMessage);
    }

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

  // Log totalErrorCount to the error file
  const totalErrorMessage = `${new Date().toISOString()} - Total errors encountered: ${totalErrorCount}\n\n`;
  try {
    await fs.appendFile(errorLogFile, totalErrorMessage);
    logger.info(`Error count for ${dataType} logged to ${errorLogFile}`);
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
    console.warn(`Missing required field: ${fieldName}`);
    return defaultValue;
  }
  return value;
}
