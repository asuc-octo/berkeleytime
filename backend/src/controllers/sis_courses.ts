// @ts-nocheck
// https://api-central.berkeley.edu/api/72
import axios from "axios"
import fs from "fs"
import _ from "lodash"
import moment from "moment-timezone"
import { Readable } from "stream"
import stream from "stream/promises"
import zlib from "zlib"

import {
  GCLOUD_BUCKET,
  GCLOUD_PATH_SIS_COURSE_DUMPS,
  SIS_COURSE_APP_ID,
  SIS_COURSE_APP_KEY,
  URL_SIS_COURSE_API,
} from "#src/config"
import { SIS_Course } from "#src/models/_index"
import { storageClient } from "#src/services/gcloud"
import { ExpressMiddleware } from "#src/types"

export const SIS_Courses = new (class Controller {
  requestDataHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    res.json(await this.requestData({ ...req.query, user: req.user }))
  }

  requestData = async ({
    pageNumber,
    pageSize,
    user,
  }: {
    pageNumber: number
    pageSize: number
    user?: any
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
    })
    return sisResponse.data?.apiResponse?.response?.courses
  }

  requestDump: ExpressMiddleware<
    {
      pageNumber: number | null
      pageSize: number | null
    },
    {}
  > = async (req, res) => {
    let key: string
    const timestamp = moment()
      .tz("America/Los_Angeles")
      .format(`YYYY-MM-DD----HH-mm-ss----dddd`)
    if (req.user) {
      key = `${GCLOUD_PATH_SIS_COURSE_DUMPS}/dump_SIS_Course_${timestamp}----${req.user.email}.jsonl.gz`
    } else {
      key = `${GCLOUD_PATH_SIS_COURSE_DUMPS}/dump_SIS_Course_${timestamp}----root.jsonl.gz`
    }
    const googleWriteStream = storageClient.currentBucket
      .file(key)
      .createWriteStream()
    googleWriteStream.on("finish", () => {
      console.info(
        `${moment()
          .tz("America/Los_Angeles")
          .format(`YYYY-MM-DD HH-mm-ss`)}\tsuccessful close on stream "${key}"`
      )
    })
    let bytesSent = 0
    let pageNumber = 1
    let sisCourses
    const pageSize = 500
    do {
      sisCourses = await this.requestData({
        pageNumber,
        pageSize,
      })
      console.info(`pageNumber ${pageNumber.toString().padStart(4, "0")}`)
      for (let sisCourse of sisCourses) {
        const jsonl = `${JSON.stringify(sisCourse)}\n`
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
            )
          }),
          googleWriteStream,
          { end: false } // https://github.com/nodejs/node/pull/40886
        )
      }
    } while (sisCourses.length == pageSize && pageNumber++ < Infinity)
    googleWriteStream.end()
    res.json({ key: `gs://${GCLOUD_BUCKET}/${key}` })
  }

  parseDump: ExpressMiddleware<{}, {}> = async (req, res) => {
    const { key } = req.query
    let sisCourseCount = 0
    let jsonLine = ""

    const businessLogic = async ({ sisCourse }) => {
      /**
       * https://mongoosejs.com/docs/tutorials/findoneandupdate.html
       * example raw query in MongoDB
       * db.sis_course.find({ identifiers: [{"type":"cms-id","id":"28bfb333-c098-4893-b2a9-08a15a099f11"},{"type":"cs-course-id","id":"124556"},{"type":"cms-version-independent-id","id":"780a3bbb-4b28-4a02-bf7a-20c3f6d3c998"}]})
       * db.sis_course_histories.find({ collectionId: ObjectId("60d48b6c2a31c9ae8d937058") }).pretty()
       */
      const foundCourse = await SIS_Course.findOne({
        identifiers: sisCourse.identifiers,
      })
      if (_.isEqual(foundCourse?.toJSON(), sisCourse)) {
        console.info(
          moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`) +
            ` SIS COURSE COUNT: ${sisCourseCount}`.padEnd(50, " ") +
            `no changes: (${foundCourse.id}) "${foundCourse.displayName}" / "${foundCourse.title}"`
        )
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
        )
        console.info(
          moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`) +
            ` SIS COURSE COUNT: ${sisCourseCount}`.padEnd(50, " ") +
            (result.lastErrorObject?.updatedExisting
              ? `updated (${result.value?._id}) '${result.value?.displayName}' '${result.value?.title}'`
              : `created (${result.lastErrorObject?.upserted}) "${result.value?.displayName}' '${result.value?.title}'`)
        )
      }
      sisCourseCount++
      // const history = await SIS_Course.getHistories(result.value._id).limit(1)
      // const history = await SIS_Course.history
      //   .findOne({
      //     collectionId: result.value._id,
      //   })
      //   .sort({ updatedAt: "desc" })
    }

    /**
     * Parse lines as they stream in from internet, to avoid entire file load
     * https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback
     */
    await stream.pipeline(
      storageClient.currentBucket
        .file(`${GCLOUD_PATH_SIS_COURSE_DUMPS}/${key}`)
        .createReadStream(),
      zlib.createGunzip(),
      async function* (source) {
        source.setEncoding("utf8")
        for await (const chunk of source) {
          for (let c of chunk) {
            if (c == "\n") {
              await businessLogic({
                sisCourse: JSON.parse(jsonLine),
              })
              jsonLine = ""
            } else {
              jsonLine += c
            }
          }
          yield "" // we write nothing because we don't want to save to disk
        }
      },
      fs.createWriteStream("/dev/null")
    )
    console.info(
      `${moment()
        .tz("America/Los_Angeles")
        .format(`YYYY-MM-DD HH-mm-ss`)}\tsuccessful close on stream "${key}"`
    )

    res.json({ success: true })
  }
})()
