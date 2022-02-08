import axios from "axios"
import fs from "fs"
import moment from "moment-timezone"
import querystring from "querystring"
import stream from "stream/promises"

import {
  GCLOUD_PATH_SIS_COURSE_DUMPS,
  SIS_COURSE_APP_ID,
  SIS_COURSE_APP_KEY,
  URL_SIS_COURSE_API,
} from "#src/config"
import { SIS_Course } from "#src/models/_index"
import { storageClient } from "#src/services/gcloud"
import { ExpressMiddleware } from "#src/types"

axios.defaults.headers["app_id"] = SIS_COURSE_APP_ID
axios.defaults.headers["app_key"] = SIS_COURSE_APP_KEY
axios.defaults.headers["Accept"] = "application/json"

export const SIS_Courses = new (class Controller {
  requestDataHandler: ExpressMiddleware<
    {
      pageNumber: number | null
      pageSize: number | null
      statusCode: "ACTIVE" | null
    },
    {}
  > = async (req, res) => {
    res.json(await this.requestData({ ...req.body, user: req.user }))
  }

  requestData = async ({
    pageNumber,
    pageSize,
    statusCode,
    user,
  }: {
    pageNumber: number
    pageSize: number
    statusCode: string
    user?: any
  }) => {
    const sisResponse = await axios.get(
      `${URL_SIS_COURSE_API}?${querystring.stringify({
        "page-number": pageNumber,
        "page-size": pageSize,
        "status-code": statusCode,
      })}`
    )
    return sisResponse.data.apiResponse.response.courses
  }

  requestDump: ExpressMiddleware<
    {
      pageLimit?: number
      pageNumber: number | null
      pageSize: number | null
      statusCode: "ACTIVE" | null
    },
    {}
  > = async (req, res) => {
    /*
     * 2021-06-21
     * https://apis.berkeley.edu/sis/v2/courses?page-number=0&page-size=1000&status-code=ACTIVE
     * So that we can test many re-runs without pissing off SIS (rate limits),
     * go through all of the course JSON at one time, stream contents to GCP
     * while it comes in so that program doesn't risk running out of RAM,
     * while also not taking up disk space
     * planned implementation so far:
     * - install and import gcloud-sdk ✅
     * - configure keys to use GCS ✅
     * - open low-level socket or stream to GCS path ✅
     * - increment page-size until API returns an error or end is reached ✅
     * - close the stream in GCS, thereby saving file ✅
     *
     * pageSizes tested (all times relate to full dump response time):
     *  - 1000
     *  - 2000 (91.74s)
     */
    let { pageLimit, pageNumber, pageSize, statusCode } = req.body
    let key: string
    const timestamp = moment()
      .tz("America/Los_Angeles")
      .format(`YYYY-MM-DD___HH-mm-ss___dddd`)
    if (req.user) {
      key = `${GCLOUD_PATH_SIS_COURSE_DUMPS}/dump_SIS_Course_${timestamp}___${req.user.email}.jsonl`
    } else {
      key = `${GCLOUD_PATH_SIS_COURSE_DUMPS}/dump_SIS_Course_${timestamp}___root.jsonl`
    }
    const writeStream = storageClient.currentBucket
      .file(key)
      .createWriteStream()
    writeStream.on("finish", () => {
      console.log(
        `${moment()
          .tz("America/Los_Angeles")
          .format(`YYYY-MM-DD HH-mm-ss`)}\tsuccessful close on stream "${key}"`
      )
    })
    try {
      let sisCourses
      do {
        sisCourses = await this.requestData({
          pageNumber,
          pageSize,
          statusCode,
        })
        for (let sisCourse of sisCourses) {
          const jsonl = `${JSON.stringify(sisCourse)}\n`
          writeStream.write(jsonl, null, () => {
            console.log(
              `${moment()
                .tz("America/Los_Angeles")
                .format(`YYYY-MM-DD HH-mm-ss`)}\t${Buffer.byteLength(
                jsonl
              )} bytes written to stream "${key}"`
            )
          })
        }
      } while (
        sisCourses.length == pageSize &&
        pageNumber++ < (pageLimit ? pageLimit : Infinity)
      )
    } catch (err) {
      console.error(err)
      throw err
    }

    writeStream.end()
    res.json({ key })
  }

  parseDump: ExpressMiddleware<{}, {}> = async (req, res) => {
    const { key } = req.body

    let byteCount = 0
    let sisCourseCount = 0
    let jsonLine = ""

    const businessLogic = async ({ sisCourse }) => {
      /**
       * https://mongoosejs.com/docs/tutorials/findoneandupdate.html
       * example raw query in MongoDB
       * db.sis_course.find({ identifiers: [{"type":"cms-id","id":"28bfb333-c098-4893-b2a9-08a15a099f11"},{"type":"cs-course-id","id":"124556"},{"type":"cms-version-independent-id","id":"780a3bbb-4b28-4a02-bf7a-20c3f6d3c998"}]})
       * db.sis_course_histories.find({ collectionId: ObjectId("60d48b6c2a31c9ae8d937058") }).pretty()
       */
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
      console.log(
        `${moment()
          .tz("America/Los_Angeles")
          .format(
            `YYYY-MM-DD HH-mm-ss`
          )} ************************ SIS COURSE COUNT:\t${sisCourseCount++}\t${
          result.lastErrorObject.updatedExisting
            ? `UPDATED "${result.value.displayName} '${result.value.title}'" (${result.value._id})`
            : `CREATED "${result.value.displayName} '${result.value.title}'" (${result.lastErrorObject.upserted})`
        }`
      )
      // const history = await SIS_Course.getHistories(result.value._id).limit(1)
      // const history = await SIS_Course.history
      //   .findOne({
      //     collectionId: result.value._id,
      //   })
      //   .sort({ updatedAt: "desc" })
      // if (history && Object.keys(history.diffs).length > 1) {
      //   console.log(
      //     `************************ SIS COURSE COUNT:\t${sisCourseCount++}\t${
      //       result.lastErrorObject.updatedExisting
      //         ? `UPDATED "${result.value.displayName} '${result.value.title}'" (${result.value._id})`
      //         : `CREATED "${result.value.displayName} '${result.value.title}'" (${result.lastErrorObject.upserted})`
      //     }`
      //   )
      // } else {
      //   console.log(
      //     `************************ SIS COURSE COUNT:\t${sisCourseCount++}\t${
      //       result.lastErrorObject.updatedExisting
      //         ? ``
      //         : `CREATED "${result.value.displayName} '${result.value.title}'" (${result.lastErrorObject.upserted})`
      //     }`
      //   )
      // }
    }

    // const bulkBusinessLogic = async ({ sisCourse, batch }) => {
    //   batch
    //     .find({ identifiers: sisCourse.identifiers })
    //     .update(sisCourse, { strict: false, upsert: true })
    // }
    // const batch = SIS_Course.collection.initializeUnorderedBulkOp() // bulkBusinessLogic
    // await batch.execute() // bulkBusinessLogic

    /**
     * Parse lines as they stream in from internet, to avoid entire file load
     * https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback
     */
    await stream.pipeline(
      storageClient.currentBucket
        .file(`${GCLOUD_PATH_SIS_COURSE_DUMPS}/${key}`)
        .createReadStream(),
      async function* (source) {
        source.setEncoding("utf8")
        for await (const chunk of source) {
          /*
           * Process all characters in dumb algorithm, until hit newline
           * This builds the single-line JSON line, ready for processing
           * TODO: Make algorithm more efficient?
           */
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
          byteCount += chunk.length
          yield "" // we write nothing because we don't want to save to disk
        }
      },
      fs.createWriteStream("/dev/null")
    )
    console.log(
      `${moment()
        .tz("America/Los_Angeles")
        .format(
          `YYYY-MM-DD HH-mm-ss`
        )}\t successful close on stream "${key}" (bytes: ${byteCount})`
    )
    res.json({ success: true })
  }
})()
