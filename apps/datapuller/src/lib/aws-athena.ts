import {
  AthenaClient,
  GetQueryExecutionCommand,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Papa from "papaparse";

export class QueryExecutor {
  private database: string;
  private s3Output: string;
  private regionName: string;
  private workGroup: string;

  private query: string;
  private athenaClient: AthenaClient;
  private s3Client: S3Client;

  constructor(
    database: string,
    s3Output: string,
    regionName: string,
    workGroup: string,
    query: string
  ) {
    this.database = database;
    this.s3Output = s3Output;
    this.regionName = regionName;
    this.workGroup = workGroup;
    this.query = query;
    this.athenaClient = new AthenaClient({ region: this.regionName });
    this.s3Client = new S3Client({ region: this.regionName });
  }

  /**
   * @returns The query execution ID
   */
  private async initialize() {
    try {
      const command = new StartQueryExecutionCommand({
        QueryString: this.query,
        QueryExecutionContext: {
          Database: this.database,
        },
        ResultConfiguration: {
          OutputLocation: this.s3Output,
        },
        WorkGroup: this.workGroup,
      });

      const response = await this.athenaClient.send(command);

      return response.QueryExecutionId;
    } catch (error) {
      console.error("Error starting query execution:", error);
    }
  }

  /**
   * Download the result from S3
   * @param queryId The query execution ID
   * @returns The parsed data from the query
   */
  private async download<T>(queryId: string) {
    try {
      const parsedS3Output = new URL(this.s3Output);

      const bucket = parsedS3Output.host;
      const path = parsedS3Output.pathname.replace(/^\//, "");
      const objectKey = `${path}${queryId}.csv`;

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      });

      const response = await this.s3Client.send(command);

      const body = await response.Body?.transformToString();

      if (!body) throw new Error("No data received from S3");

      const parsedData = Papa.parse<T>(body, {
        header: true,
        skipEmptyLines: true,
      });

      return parsedData.data;
    } catch (error) {
      console.error("Error downloading data:", error);
    }
  }

  // Run the Athena query and wait for the result
  async execute<T>() {
    const queryExecutionId = await this.initialize();
    if (!queryExecutionId) return;

    let queryStatus: string | undefined = undefined;

    try {
      // Wait for the query to finish
      while (!queryStatus || ["QUEUED", "RUNNING"].includes(queryStatus)) {
        const command = new GetQueryExecutionCommand({
          QueryExecutionId: queryExecutionId,
        });

        const execution = await this.athenaClient.send(command);

        queryStatus = execution.QueryExecution?.Status?.State;
        console.log(queryStatus);

        if (queryStatus === "FAILED" || queryStatus === "CANCELLED") {
          throw new Error(
            `Athena query "${this.query}" failed or was cancelled: ${execution.QueryExecution?.Status?.StateChangeReason}`
          );
        }

        // Query execution happens in the background, so we need to wait for the result
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      return await this.download<T>(queryExecutionId);
    } catch (error) {
      console.error("Error executing query:", error);
    }
  }
}
