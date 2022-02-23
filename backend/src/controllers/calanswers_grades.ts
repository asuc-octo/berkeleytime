// CalAnswers Grade Distribution CSV parsing (CSVs are downloaded manually)
// https://calanswers-bi.berkeley.edu:9503/analytics/
// "Dashboards" (top header) > "Student Curriculum" > "Course Grade Distribution" > "Grade Distribution" => Reset/clear all filters => Select a semester => Download Tab-Delimited file
import fs from "fs";
import _ from "lodash";
import moment from "moment-timezone";
import PQueue from "p-queue";
import stream from "stream/promises";

import { GCLOUD_PATH_CAL_ANSWERS_GRADE_DUMPS } from "#src/config";
import ts from "#src/helpers/time";
import { CalAnswers_Grade } from "#src/models/_index";
import { storageClient } from "#src/services/gcloud";
import { ExpressMiddleware } from "#src/types";

const THESE_FIELDS_ALWAYS_SEEM_TO_BE_BLANK = [
  `% Grades Receivedof Enrollment`,
  `Letter Grd Cnt`,
  `Average Grade`,
];

const parseCalAnswersGradeLine = ({ header, line, term }) => {
  const recordFields = line.split("\t"); // CSV has commas in course title names, so we use tab-delimited files instead
  const calAnswersObject = {};
  for (let [index, element] of recordFields.entries()) {
    if (THESE_FIELDS_ALWAYS_SEEM_TO_BE_BLANK.includes(header[index])) {
      continue;
    } else if (header[index] == "Course Control Nbr") {
      element = parseInt(element); // remove leading zeros and convert to number, because SIS_Class_Section.id uses integer
    } else if (header[index] == "Instructor Name") {
      element = element.split(";").map((instructor) => instructor.trim()); // CalAnswers delimits multiple instructors with ";"
    } else if (header[index] == "Grade Sort Nbr") {
      element = parseInt(element) ? parseInt(element) : NaN; // it's possible for "Grade Sort Nbr" field to be blank
    } else if (header[index] == "Enrollment Cnt") {
      element = parseInt(element);
    } else {
      element = element.trim();
    }
    calAnswersObject[header[index].replace(/ /g, "")] = element;
  }
  return { ...calAnswersObject, term };
};

export const CalAnswers_Grades = new (class Controller {
  parseGradeDumpHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    console.info(JSON.stringify(req.user));
    res.json(await this.parseGradeDump({ ...req.query, user: req.user }));
  };
  parseGradeDump = async (req) => {
    const start = moment().tz("America/Los_Angeles");
    const shared = { gradeCount: 1 };

    const businessLogic = async (calAnswersObject, lineNumber) => {
      const CAstring = `${JSON.stringify(
        calAnswersObject.term
      )} ${JSON.stringify(calAnswersObject)}`;
      const result = await CalAnswers_Grade.findOneAndUpdate(
        {
          CourseControlNbr: calAnswersObject.CourseControlNbr,
          term: calAnswersObject.term,
          GradeNm: calAnswersObject.GradeNm,
        },
        calAnswersObject,
        {
          lean: true,
          new: true,
          strict: false,
          upsert: true,
          rawResult: true,
        }
      );
      console.info(
        ts() +
          ` GRADE: ${shared.gradeCount++}, LINE: ${lineNumber
            .toString()
            .padStart(5, "0")}`.padEnd(40, " ") +
          (result.lastErrorObject?.updatedExisting
            ? `updated (${result.value?._id}) ${CAstring}`
            : `created (${result.lastErrorObject?.upserted}) ${CAstring}`)
      );
    };

    const { key } = req;
    const queue = new PQueue({ concurrency: 10 });
    const [gFiles] = await storageClient.currentBucket.getFiles({
      prefix: GCLOUD_PATH_CAL_ANSWERS_GRADE_DUMPS,
    });
    const files: any = key
      ? [`${GCLOUD_PATH_CAL_ANSWERS_GRADE_DUMPS}/${key}`]
      : _.orderBy(gFiles, (f) => f.name, "desc")
          .map((f) => f.name)
          .filter((f) => f.endsWith(".csv"));
    if (files.length == 0) return { msg: `No object found` };

    for (const file of files) {
      let lineNumber = 2;
      console.info(`${ts()} OPENING: ${file}`.padEnd(40, " ").yellow);
      const reg = file.match(/(\d{4})-(\d{2})-([a-zA-Z]+)\.csv/);
      const term = {
        year: parseInt(reg[1]),
        month: parseInt(reg[2]),
        semester: reg[3],
      }; // this is necessary because Course Control Numbers (CCN) can collide across semesters
      let csvLine = "";
      let header = [];

      const write = fs.createWriteStream("/dev/null");
      const read = storageClient.currentBucket
        .file(file)
        .createReadStream()
        .on("end", async () => {
          await queue.onEmpty();
          write.end();
        });

      // still waiting for types on stream.pipelineOptions to update {end: false}: https://github.com/nodejs/node/pull/40886, https://github.com/DefinitelyTyped/DefinitelyTyped/blob/da0e347d6a7df8a6a67812c11d388fea0d106852/types/node/stream.d.ts#L1029
      // @ts-ignore
      await stream.pipeline(
        read,
        async function* (source) {
          source.setEncoding("utf16le");
          for await (const chunk of source) {
            try {
              let lines = [];
              for (const c of chunk) {
                if (c == "\n") {
                  lines.push(csvLine);
                  if (header.length == 0) {
                    lines.shift(); // take header line into account
                    header = csvLine.split("\t").map((field) => field.trim());
                  }
                  csvLine = "";
                } else {
                  csvLine += c;
                }
              }
              for (const line of lines) {
                await queue.onSizeLessThan(100);
                queue.add(() =>
                  businessLogic(
                    parseCalAnswersGradeLine({
                      header,
                      line,
                      term,
                    }),
                    lineNumber++
                  )
                );
              }
            } catch (e) {
              console.error(e);
            }
            yield ""; // we write nothing because we don't want to save to disk. TypeScript complains if no /dev/null
          }
        },
        write,
        { end: false }
      );
      console.info(
        `${ts()} ` +
          `GRADE: ${shared.gradeCount}`.padEnd(40, " ") +
          `finished parsing of grade dump "${file}"`
      );
    }
    console.info(`${ts()}\tfinished parsing of all grade dumps`);
    return { start, finish: moment().tz("America/Los_Angeles") };
  };
})();
