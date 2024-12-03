import {
  AthenaClient,
  GetQueryExecutionCommand,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Papa from "papaparse";

export interface RawGradeDistribution {
  course_id: string;
  course_offer_nbr: string;
  semester_year_term_cd: string;
  class_number: string;
  subject_cd: string;
  course_number: string;
  session_code: string;
  class_section_cd: string;
  grade_count: string;
  distinct_grades: string;
  grade_count_a_plus: string;
  grade_count_a: string;
  grade_count_a_minus: string;
  grade_count_b_plus: string;
  grade_count_b: string;
  grade_count_b_minus: string;
  grade_count_c_plus: string;
  grade_count_c: string;
  grade_count_c_minus: string;
  grade_count_d_plus: string;
  grade_count_d: string;
  grade_count_d_minus: string;
  grade_count_f: string;
  grade_count_p: string;
  grade_count_np: string;
  grade_count_s: string;
  grade_count_u: string;
  grade_count_cr: string;
  grade_count_nc: string;
  grade_count_hh: string;
  grade_count_h: string;
  grade_count_pc: string;
}

export const formatDistribution = (distribution: RawGradeDistribution) => {
  // TODO: Pivot the data
  return {
    subject: distribution.subject_cd,
    courseNumber: distribution.course_number,
    courseOfferingNumber: parseInt(distribution.course_offer_nbr),
    termId: distribution.semester_year_term_cd,
    session: distribution.session_code,
    classNumber: distribution.class_number,
    sectionNumber: distribution.class_section_cd,
    count: parseInt(distribution.grade_count),
    distinct: parseInt(distribution.distinct_grades),
    countAPlus: parseInt(distribution.grade_count_a_plus),
    countA: parseInt(distribution.grade_count_a),
    countAMinus: parseInt(distribution.grade_count_a_minus),
    countBPlus: parseInt(distribution.grade_count_b_plus),
    countB: parseInt(distribution.grade_count_b),
    countBMinus: parseInt(distribution.grade_count_b_minus),
    countCPlus: parseInt(distribution.grade_count_c_plus),
    countC: parseInt(distribution.grade_count_c),
    countCMinus: parseInt(distribution.grade_count_c_minus),
    countDPlus: parseInt(distribution.grade_count_d_plus),
    countD: parseInt(distribution.grade_count_d),
    countDMinus: parseInt(distribution.grade_count_d_minus),
    countF: parseInt(distribution.grade_count_f),
    countP: parseInt(distribution.grade_count_p),
    countNP: parseInt(distribution.grade_count_np),
    countS: parseInt(distribution.grade_count_s),
    countU: parseInt(distribution.grade_count_u),
    countCR: parseInt(distribution.grade_count_cr),
    countNC: parseInt(distribution.grade_count_nc),
    countHH: parseInt(distribution.grade_count_hh),
    countH: parseInt(distribution.grade_count_h),
    countPC: parseInt(distribution.grade_count_pc),
  };
};

/**
 * QueryExecutor
 * A class to execute Athena queries and download the results from S3
 * @param query The query to execute
 * @returns The parsed data from the query
 * @example
 * const query = `SELECT * FROM "lf_cs_curated"."student_grade_distribution_data" WHERE semester_year_term_cd = '2242'`;
 * const executor = new QueryExecutor(query);
 * const data = await executor.execute();
 */
class QueryExecutor {
  // TODO: Environment variables
  private database = process.env.AWS_DATABASE as string;
  private s3Output = process.env.AWS_S3_OUTPUT as string;
  private regionName = process.env.AWS_REGION_NAME as string;
  private workGroup = process.env.AWS_WORKGROUP as string;

  private query: string;
  private athenaClient: AthenaClient;
  private s3Client: S3Client;

  constructor(query: string) {
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
  private async download(queryId: string) {
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

      const parsedData = Papa.parse<RawGradeDistribution>(body, {
        header: true,
        skipEmptyLines: true,
      });

      return parsedData.data;
    } catch (error) {
      console.error("Error downloading data:", error);
    }
  }

  // Run the Athena query and wait for the result
  async execute() {
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

      return await this.download(queryExecutionId);
    } catch (error) {
      console.error("Error executing query:", error);
    }
  }
}

/**
 * The Berkeley Data Group provides Berkeleytime with access to Athena
 * for querying grade distribution data.
 */
export const getGradeDistributionDataByTerm = async (termId: string) => {
  const query = `SELECT course_id, course_offer_nbr, semester_year_term_cd, class_number, subject_cd, course_number, session_code, class_section_cd, grade_count, distinct_grades, grade_count_a_plus, grade_count_a, grade_count_a_minus, grade_count_b_plus, grade_count_b, grade_count_b_minus, grade_count_c_plus, grade_count_c, grade_count_c_minus, grade_count_d_plus, grade_count_d, grade_count_d_minus, grade_count_f, grade_count_p, grade_count_np, grade_count_s, grade_count_u, grade_count_cr, grade_count_nc, grade_count_hh, grade_count_h, grade_count_pc FROM "lf_cs_curated"."student_grade_distribution_data" WHERE semester_year_term_cd = '${termId}'`;
  const enrollment = new QueryExecutor(query);
  const data = await enrollment.execute();
  return data;
};
