// CalAnswers Grade Distribution CSV parsing (CSVs are downloaded manually)
// https://calanswers-bi.berkeley.edu:9503/analytics/
// "Dashboards" (top header) > "Student Curriculum" > "Course Grade Distribution" > "Grade Distribution" => Reset/clear all filters => Select a semester => Download Tab-Delimited file
import fs from "fs";
import _ from "lodash";
import moment from "moment-timezone";
import PQueue from "p-queue";
import stream from "stream/promises";

import { GCLOUD_PATH_CAL_ANSWERS_GRADE_DUMPS } from "#src/config";
import { CalAnswers_Grade } from "#src/models/_index";
import { storageClient } from "#src/services/gcloud";
import { ExpressMiddleware } from "#src/types";

const OMIT_KEYS = ["_created", "_id", "_updated", "_version"];
const THESE_FIELDS_ALWAYS_SEEM_TO_BE_BLANK = [
  `% Grades Receivedof Enrollment`,
  `Letter Grd Cnt`,
  `Average Grade`,
];

const parseCalAnswersGradeLine = ({ header, line, term }) => {
  const values = line.split("\t"); // CSV has commas in course title names, so we use tab-delimited files instead
  const calAnswersObject = {};
  for (let [index, element] of values.entries()) {
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
    calAnswersObject[header[index]] = element;
  }
  return { ...calAnswersObject, term };
};

export const CalAnswers_Grades = new (class Controller {
  parseGradeDump: ExpressMiddleware<{}, {}> = async (req, res) => {
    const shared = { gradeCount: 0 };

    const businessLogic = async (calAnswersObject) => {
      const CAstring = JSON.stringify(calAnswersObject);
      const original = await CalAnswers_Grade.findOne(calAnswersObject).cache(
        43200
      );
      const foundGrade = _.omitBy(
        original?._doc,
        (v, k) => OMIT_KEYS.includes(k) || v === undefined
      );
      if (_.isEqual(foundGrade, calAnswersObject)) {
        console.info(
          moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`) +
            ` GRADE COUNT: ${shared.gradeCount}`.padEnd(50, " ") +
            `no changes: (${original?._id}) ${CAstring}`
        );
      } else {
        const result = await CalAnswers_Grade.findOneAndUpdate(
          calAnswersObject,
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
          moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`) +
            ` GRADE COUNT: ${shared.gradeCount}`.padEnd(50, " ") +
            (result.lastErrorObject?.updatedExisting
              ? `updated (${result.value?._id}) ${JSON.stringify(
                  calAnswersObject
                )}`
              : `created (${result.lastErrorObject?.upserted}) ${JSON.stringify(
                  calAnswersObject
                )}`)
        );
      }
      shared.gradeCount++;
    };

    const { key } = req.query;
    const queue = new PQueue({ concurrency: 10 });

    const [gFiles] = await storageClient.currentBucket.getFiles({
      prefix: GCLOUD_PATH_CAL_ANSWERS_GRADE_DUMPS,
    });
    const files: any = key
      ? [`${GCLOUD_PATH_CAL_ANSWERS_GRADE_DUMPS}/${key}`]
      : _.orderBy(gFiles, (f) => f.name, "desc").map((f) => f.name);
    if (files.length == 0) return res.json({ msg: `No object found` });

    for (const file of files) {
      console.info(
        `${moment()
          .tz("America/Los_Angeles")
          .format(`YYYY-MM-DD HH-mm-ss`)} OPENING: ${file}`.padEnd(50, " ")
          .green
      );
      const reg = file.match(/(\d{4})-(\d{2})-([a-zA-Z]+)\.csv/);
      const term = {
        year: parseInt(reg[1]),
        month: parseInt(reg[2]),
        semester: reg[3],
      }; // this is necessary because Course Control Numbers (CCN) can collide across semesters
      let csvLine = "";
      let header = [];
      await stream.pipeline(
        storageClient.currentBucket.file(file).createReadStream(),
        async function* (source) {
          source.setEncoding("utf16le");
          for await (const chunk of source) {
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
              await queue.onSizeLessThan(1000);
              queue.add(() =>
                businessLogic(
                  parseCalAnswersGradeLine({
                    header,
                    line,
                    term,
                  })
                )
              );
            }
            yield ""; // we write nothing because we don't want to save to disk. TypeScript complains if no /dev/null
          }
        },
        fs.createWriteStream("/dev/null")
      );
      console.info(
        `${moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`)} ` +
          `GRADE COUNT: ${shared.gradeCount++}`.padEnd(50, " ") +
          `finished parsing of grade dump "${file}"`
      );
    }
    await queue.onEmpty();
    console.info(
      `${moment()
        .tz("America/Los_Angeles")
        .format(`YYYY-MM-DD HH-mm-ss`)}\tfinished parsing of all grade dumps`
    );
    res.json({ success: true });
  };
})();
