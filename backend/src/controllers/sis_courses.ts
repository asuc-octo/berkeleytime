// @ts-nocheck
// https://api-central.berkeley.edu/api/72
import axios from "axios";
import fs from "fs";
import _ from "lodash";
import moment from "moment-timezone";
import PQueue from "p-queue";
import { Readable } from "stream";
import stream from "stream/promises";
import zlib from "zlib";

import {
  GCLOUD_BUCKET,
  GCLOUD_PATH_SIS_COURSE_DUMPS,
  SIS_COURSE_APP_ID,
  SIS_COURSE_APP_KEY,
  URL_SIS_COURSE_API,
} from "#src/config";
import { SIS_Course } from "#src/models/_index";
import { storageClient } from "#src/services/gcloud";
import { ExpressMiddleware } from "#src/types";

export const SIS_Courses = new (class Controller {
  requestDataHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    res.json(await this.requestData({ ...req.query, user: req.user }));
  };

  requestData = async ({
    pageNumber,
    pageSize,
    user,
  }: {
    pageNumber: number;
    pageSize: number;
    user?: any;
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

  requestDump: ExpressMiddleware<
    {
      pageNumber: number | null;
      pageSize: number | null;
    },
    {}
  > = async (req, res) => {
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
      for (let sisCourse of sisCourses) {
        const jsonl = `${JSON.stringify(sisCourse)}\n`;
        await stream.pipeline(
          Readable.from(jsonl),
          zlib.createGzip().on("data", (buf) => {
            console.info(
              `${moment()
                .tz("America/Los_Angeles")
                .format(`YYYY-MM-DD HH-mm-ss`)} page ${pageNumber
                .toString()
                .padStart(
                  4,
                  "0"
                )} total bytes streamed "${key}": ${(bytesSent +=
                buf.byteLength)}`
            );
          }),
          googleWriteStream,
          { end: false } // https://github.com/nodejs/node/pull/40886
        );
      }
    } while (sisCourses.length == pageSize && pageNumber++ < Infinity);
    googleWriteStream.end();
    console.info(
      `${moment()
        .tz("America/Los_Angeles")
        .format(`YYYY-MM-DD HH-mm-ss`)} successful close on stream "${key}"`
    );
    res.json({ key: `gs://${GCLOUD_BUCKET}/${key}` });
  };

  /**
   * Parse lines as they stream in from internet, to avoid entire file load
   * https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback
   */
  parseDump: ExpressMiddleware<{}, {}> = async (req, res) => {
    const { key } = req.query;
    let sisCourseCount = 0;

    const businessLogic = async ({ sisCourse }) => {
      const foundCourse = await SIS_Course.findOne({
        identifiers: sisCourse.identifiers, // it is possible for old/deprecated courses to have same 'cs-course-id', so it is important to also use 'cms-id' which is truly unique
      }).cache(43200);
      if (_.isEqual(foundCourse?.toJSON(), sisCourse)) {
        console.info(
          moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`) +
            ` SIS COURSE COUNT: ${sisCourseCount}`.padEnd(50, " ") +
            `no changes: (${foundCourse._id}) "${foundCourse.displayName}" / "${foundCourse.title}"`
        );
      } else {
        const result = await SIS_Course.findOneAndUpdate(
          { identifiers: sisCourse.identifiers },
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
          moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`) +
            ` SIS COURSE COUNT: ${sisCourseCount}`.padEnd(50, " ") +
            (result.lastErrorObject?.updatedExisting
              ? `updated (${result.value?._id}) '${result.value?.displayName}' '${result.value?.title}'`
              : `created (${result.lastErrorObject?.upserted}) "${result.value?.displayName}' '${result.value?.title}'`)
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
    if (!file && !key) return res.json({ msg: `No object found` });
    await stream.pipeline(
      storageClient.currentBucket.file(file).createReadStream(),
      zlib.createGunzip(),
      async function* (source) {
        source.setEncoding("utf8");
        for await (const chunk of source) {
          let lines = [];
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
    console.info(
      `${moment()
        .tz("America/Los_Angeles")
        .format(`YYYY-MM-DD HH-mm-ss`)}\tfinished parsing of dump "${file}"`
    );

    res.json({ success: true });
  };
})();
