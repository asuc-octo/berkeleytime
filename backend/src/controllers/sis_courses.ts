// Berkeley API Central Course API
// https://api-central.berkeley.edu/api/72
import axios from "axios";
import fs from "fs";
import jsondiffpatch from "jsondiffpatch";
import _ from "lodash";
import moment from "moment-timezone";
import PQueue from "p-queue";
import { Readable } from "stream";
import stream from "stream/promises";
import zlib from "zlib";

import {
  GCLOUD_PATH_SIS_COURSE_DUMPS,
  SIS_COURSE_APP_ID,
  SIS_COURSE_APP_KEY,
  URL_SIS_COURSE_API,
} from "#src/config";
import omitter from "#src/helpers/omitter";
import ts from "#src/helpers/time";
import { SIS_Course_Model } from "#src/models/_index";
import { storageClient } from "#src/services/gcloud";
import { ExpressMiddleware } from "#src/types";

import "@colors/colors";

export const SIS_Courses = new (class Controller {
  requestDataHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    console.info(JSON.stringify(req.user));
    res.json(await this.requestData({ ...req.query, user: req.user }));
  };
  requestData = async ({
    pageNumber,
    pageSize,
  }: {
    pageNumber: number;
    pageSize: number;
  }) => {
    const sisResponse = await axios.get(`${URL_SIS_COURSE_API}`, {
      headers: {
        app_id: SIS_COURSE_APP_ID,
        app_key: SIS_COURSE_APP_KEY,
        Accept: "application/json",
      },
      params: {
        "page-number": pageNumber,
        "page-size": pageSize,
      },
    });
    return sisResponse.data?.apiResponse?.response?.courses;
  };

  requestDumpHandler: ExpressMiddleware<
    {
      pageNumber: number | null;
      pageSize: number | null;
    },
    {}
  > = async (req, res) => {
    console.info(JSON.stringify(req.user));
    res.json(await this.requestDump({ res }));
  };
  requestDump = async ({ res }) => {
    const start = moment().tz("America/Los_Angeles");
    const key = `${GCLOUD_PATH_SIS_COURSE_DUMPS}/dump_SIS_Course.jsonl.gz`;
    let bytesSent = 0;
    let pageNumber = 1;
    const pageSize = 500;
    let sisCourses;

    const googleWriteStream = storageClient.currentBucket
      .file(key)
      .createWriteStream();
    do {
      sisCourses = await this.requestData({
        pageNumber,
        pageSize,
      });
      for (const sisCourse of sisCourses) {
        const jsonl = `${JSON.stringify(sisCourse)}\n`;

        // still waiting for types on stream.pipelineOptions to update {end: false}: https://github.com/nodejs/node/pull/40886, https://github.com/DefinitelyTyped/DefinitelyTyped/blob/da0e347d6a7df8a6a67812c11d388fea0d106852/types/node/stream.d.ts#L1029
        // @ts-ignore
        await stream.pipeline(
          Readable.from(jsonl),
          zlib.createGzip().on("data", (buf) => {
            console.info(
              `${ts()} page ${pageNumber
                .toString()
                .padStart(
                  4,
                  "0"
                )} total bytes streamed "${key}": ${(bytesSent +=
                buf.byteLength)}`
            );
          }),
          googleWriteStream,
          { end: false }
        );
      }
    } while (sisCourses.length == pageSize && pageNumber++ < Infinity);
    googleWriteStream.end();
    console.info(`${ts()} successful close on stream "${key}"`);
    return { start, finish: moment().tz("America/Los_Angeles") };
  };

  parseDumpHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    console.info(JSON.stringify(req.user));
    res.json(await this.parseDump({ req, res }));
  };
  /**
   * Parse lines as they stream in from internet, to avoid entire file load
   * https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback
   */
  parseDump = async ({ req, res }) => {
    const start = moment().tz("America/Los_Angeles");
    const { key } = req.query;
    let sisCourseCount = 0;

    const businessLogic = async ({ sisCourse }) => {
      const cmsId = _.find(sisCourse.identifiers, {
        type: "cms-id",
      }).id;
      const original = await SIS_Course_Model.findOne({
        "identifiers.id": cmsId, // it is possible for old/deprecated courses to have same 'cs-course-id', so it is important to also use 'cms-id' which is truly unique
      });
      const foundCourse = original?.toJSON();
      omitter(foundCourse);
      if (_.isEqual(foundCourse, sisCourse)) {
        if (!foundCourse) {
          // SIS Course API has at least 40 courses that have blank "" cs-course-id, 🤦🏻‍♀️ and 17 of them have 'status.code: ACTIVE' ... just... why? 🤷🏻‍♀️  MDB query: db.sis_course.find({ "identifiers.id": "", "status.code": "ACTIVE"}, {"status.code": true, "catalogNumber.formatted": true, "subjectArea.description": true, title: true })
          // prettier-ignore
          console.error(`WARNING! ONE OF THE IDENTIFIERS HAS A FATAL ERROR: ${JSON.stringify(sisCourse)}`.red);
        }
        // prettier-ignore
        console.info(ts() + ` SIS COURSE COUNT: ${sisCourseCount}`.padEnd(50, " ") + `no changes: (${original?._id}) "${foundCourse?.displayName}" / "${foundCourse?.title}"`.green);
      } else {
        const result = await SIS_Course_Model.findOneAndUpdate(
          { "identifiers.id": cmsId },
          sisCourse,
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
            ` SIS COURSE COUNT: ${sisCourseCount}`.padEnd(50, " ") +
            (result.lastErrorObject?.updatedExisting
              ? // @ts-ignore
                // prettier-ignore
                `updated (${result?.value?._id}) '${result?.value?.displayName}' '${result?.value?.title}' ${JSON.stringify(jsondiffpatch.diff(foundCourse, result?.value))}`.yellow
              : `created (${result?.lastErrorObject?.upserted}) '${result?.value?.displayName}' '${result?.value?.title}'`
                  .yellow)
        );
      }
      sisCourseCount++;
    };

    const queue = new PQueue({ concurrency: 10 });
    let jsonLine = "";
    const [files] = await storageClient.currentBucket.getFiles({
      prefix: GCLOUD_PATH_SIS_COURSE_DUMPS,
    });
    const file = key
      ? `${GCLOUD_PATH_SIS_COURSE_DUMPS}/${key}`
      : _.orderBy(files, (f) => f.name, "desc")[0].name;
    if (!file && !key) return { msg: `No object found` };
    await stream.pipeline(
      storageClient.currentBucket.file(file).createReadStream(),
      zlib.createGunzip(),
      async function* (source) {
        source.setEncoding("utf8");
        for await (const chunk of source) {
          const lines: string[] = [];
          for (const c of chunk) {
            if (c == "\n") {
              lines.push(jsonLine);
              jsonLine = "";
            } else {
              jsonLine += c;
            }
          }
          for (const line of lines) {
            await queue.onSizeLessThan(1000);
            queue.add(() => businessLogic({ sisCourse: JSON.parse(line) }));
          }
          yield ""; // we write nothing because we don't want to save to disk. TypeScript complains if no /dev/null
        }
      },
      fs.createWriteStream("/dev/null")
    );
    await queue.onEmpty();
    console.info(`${ts()}\tfinished parsing of dump "${file}"`);
    return { start, finish: moment().tz("America/Los_Angeles") };
  };
})();
