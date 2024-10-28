export async function fetchPaginatedData<T, R>(
  api: any,
  method: string,
  baseParams: Record<string, any>,
  headers: Record<string, string>,
  responseProcessor: (data: any) => R[],
  itemProcessor: (item: R) => T
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let retries = 1;

  while (retries > 0) {
    try {
      const response = await api[method](
        {
          ...baseParams,
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
      console.log("Mapping processedData with itemProcessor...");
      const transformedData = processedData.map((item, index) => {
        try {
          return itemProcessor(item);
        } catch (error) {
          console.error(`Error processing item at index ${index}:`, error);
          console.error("Problematic item:", JSON.stringify(item, null, 2));
          throw error;
        }
      });

      results.push(...transformedData);
      console.log(`Processed ${processedData.length} items from page ${page}.`);
      page++;
      retries = 1; // Reset retries on successful fetch
    } catch (error) {
      console.log(`Error fetching page ${page} of data`);
      console.log(`Unexpected error querying API. Error: "${error}"`);

      if (retries === 0) {
        console.log(`Too many errors querying API. Terminating update...`);
        break;
      }

      retries--;
      console.log(`Retrying...`);
    }
  }

  return results;
}
