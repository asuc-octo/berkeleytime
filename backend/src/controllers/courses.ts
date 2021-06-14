import {
  SIS_CLASS_APP_ID,
  SIS_CLASS_APP_KEY,
  SIS_COURSE_APP_ID,
  SIS_COURSE_APP_KEY,
} from "#src/config"
import { Course } from "#src/models/_index"
import { ExpressMiddleware } from "#src/types"

export const Courses = new (class Controller {
  pullXml: ExpressMiddleware<{}, {}> = async ({}, res) => {
    /*
     * GET /api/coursePull
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
    console.log(
      SIS_CLASS_APP_ID,
      SIS_CLASS_APP_KEY,
      SIS_COURSE_APP_ID,
      SIS_COURSE_APP_KEY
    )

    console.log(await Course.find({}))

    console.log("hi")
    res.json({ msg: "🙂" })
  }
})()
