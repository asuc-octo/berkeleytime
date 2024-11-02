import {
  AthenaClient,
  GetQueryExecutionCommand,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Papa from "papaparse";

import { GradeDistributionModel, GradeDistributionType } from "@repo/common";

import mongooseLoader from "../bootstrap/loaders/mongoose";

interface RawDistribution {
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

const formatDistribution = (distribution: RawDistribution) => {
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

class StudentEnrollment {
  private database = process.env.AWS_DATABASE;
  private s3Output = process.env.AWS_S3_OUTPUT;
  private regionName = process.env.AWS_REGION_NAME;
  // private filename = process.env.AWS_FILENAME;
  private workGroup = process.env.AWS_WORKGROUP;

  private query: string;
  private athenaClient: AthenaClient;
  private s3Client: S3Client;

  constructor(query: string) {
    this.query = query;
    this.athenaClient = new AthenaClient({ region: this.regionName });
    this.s3Client = new S3Client({ region: this.regionName });
  }

  // Load the config details and start query execution
  async loadConf(query: string) {
    try {
      const command = new StartQueryExecutionCommand({
        QueryString: query,
        QueryExecutionContext: {
          Database: this.database,
        },
        ResultConfiguration: {
          OutputLocation: this.s3Output,
        },
        WorkGroup: this.workGroup,
      });

      const response = await this.athenaClient.send(command);

      console.log("Execution ID: " + response.QueryExecutionId);

      return response.QueryExecutionId;
    } catch (error) {
      console.error(error);

      return;
    }
  }

  // Run the Athena query and wait for the result
  async runQuery() {
    const queries = [this.query];

    for (const query of queries) {
      const queryExecutionId = await this.loadConf(query);
      if (!queryExecutionId) return;

      let queryStatus: string | undefined = undefined;

      try {
        // Check the status of the query execution
        while (
          queryStatus === "QUEUED" ||
          queryStatus === "RUNNING" ||
          !queryStatus
        ) {
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

          // Sleep for 10 seconds
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }

        console.log(`Query "${this.query}" finished.`);

        // Download the result from S3
        await this.downloadDataFile(queryExecutionId);
      } catch (err) {
        console.error(err);
      }
    }
  }

  // Download the result file from S3
  async downloadDataFile(queryId: string) {
    try {
      const parsedS3Output = new URL(this.s3Output as string);

      const bucket = parsedS3Output.host || "";

      const path = parsedS3Output.pathname
        ? parsedS3Output.pathname.replace(/^\//, "")
        : "";

      const objectKey = `${path}${queryId}.csv`;

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      });

      const response = await this.s3Client.send(command);

      const body = await response.Body?.transformToString();

      if (!body) {
        throw new Error("No data received from S3");
      }

      const parsedData = Papa.parse<RawDistribution>(body, {
        header: true,
        skipEmptyLines: true,
      });

      const formattedData = parsedData.data.map(
        (row) => formatDistribution(row) as GradeDistributionType
      );

      const bulkOperations = formattedData.map((data) => ({
        updateOne: {
          filter: { classNumber: data.classNumber },
          update: { $set: data },
          upsert: true,
        },
      }));

      await GradeDistributionModel.bulkWrite(bulkOperations);

      console.log(
        `Inserted ${formattedData.length} records into GradeDistribution`
      );
    } catch (err) {
      console.error(err);
    }
  }
}

const main = async () => {
  await mongooseLoader();

  const enrollment = new StudentEnrollment(
    `SELECT course_id, course_offer_nbr, semester_year_term_cd, class_number, subject_cd, course_number, session_code, class_section_cd, grade_count, distinct_grades, grade_count_a_plus, grade_count_a, grade_count_a_minus, grade_count_b_plus, grade_count_b, grade_count_b_minus, grade_count_c_plus, grade_count_c, grade_count_c_minus, grade_count_d_plus, grade_count_d, grade_count_d_minus, grade_count_f, grade_count_p, grade_count_np, grade_count_s, grade_count_u, grade_count_cr, grade_count_nc, grade_count_hh, grade_count_h, grade_count_pc FROM "lf_cs_curated"."student_grade_distribution_data" WHERE semester_year_term_cd = '2242'`
  );

  await enrollment.runQuery();
};

main().catch(console.error);
