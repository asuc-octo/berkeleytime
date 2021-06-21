import axios from "axios"
import moment from "moment-timezone"
import querystring from "querystring"
import YAML from "yaml"

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
    /*
     * 2021-06-21
     * https://apis.berkeley.edu/sis/v2/courses?page-number=0&page-size=1000&status-code=ACTIVE
     * So that we can test many re-runs without pissing off SIS (rate limits),
     * go through all of the course XML pages at one time, stream contents to GCP
     * while it comes in so that program doesn't risk running out of RAM,
     * while also not taking up disk space
     * planned implementation so far:
     * - install and import gcloud-sdk
     * - configure keys to use GCS
     * - open low-level socket or stream to GCS path
     * - increment page-size until API returns an error or end is reached
     * - close the stream in GCS, thereby saving the XML file
     */
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
    return sisResponse.data.apiResponse.response.any.courses
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
     * go through all of the course XML pages at one time, stream contents to GCP
     * while it comes in so that program doesn't risk running out of RAM,
     * while also not taking up disk space
     * planned implementation so far:
     * - install and import gcloud-sdk ✅
     * - configure keys to use GCS ✅
     * - open low-level socket or stream to GCS path ✅
     * - increment page-size until API returns an error or end is reached ✅
     * - close the stream in GCS, thereby saving file ✅
     *
     * pageSizes tested:
     *  - 1000
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
          .format(`YYYY-MM-DD HH-mm-ss`)}\tsuccess on stream "${key}"`
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

    const readStream = storageClient.currentBucket
      .file(`${GCLOUD_PATH_SIS_COURSE_DUMPS}/${key}`)
      .createReadStream()
    const buf = []
    let byteCount = 0
    readStream.on("data", (chunk) => {
      byteCount += chunk.length
      buf.push(chunk)
    })
    readStream.on("end", () => {
      console.log(
        `${moment()
          .tz("America/Los_Angeles")
          .format(
            `YYYY-MM-DD HH-mm-ss`
          )}\tdownload success (bytes: ${byteCount}) on stream "${key}"`
      )
      const json = []
      // TODO: parse lines as they come in, not at the end
      for (let line of buf.toString().trim().split("\n")) {
        console.log(JSON.parse(line.trim()))
      }
      res.json({ success: true })
    })
    // const bulk = SIS_Course.collection.initializeUnorderedBulkOp()
    // bulk.find()
    // await bulk.execute()
    // let course = await SIS_Course.findOne({ title: "asdf" })
    // console.log(await SIS_Course.getHistories(course.id))
  }
})()
