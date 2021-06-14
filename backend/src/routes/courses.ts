import express from "express"

const router = express.Router()

router.get("/coursePull", async (req, res, next) => {
  /*
   * GET /api/coursePull
   * https://apis.berkeley.edu/sis/v2/courses?page-number=0&page-size=1000&status-code=ACTIVE
   * So that we can test many re-runs without pissing off SIS (rate limits),
   * go through all of the course XML pages at one time, stream contents to GCP
   * while it comes in so that program doesn't risk running out of RAM,
   * while also not taking up disk space
   * planned implementation so far:
   * - install gcloud-sdk
   * - configure keys to use GCS
   * - open low-level socket or stream to GCS path
   * - increment page-size until API returns an error or end is reached
   * - close the stream in GCS, thereby saving the XML file
   */
  console.log("hi")
  res.json({ msg: "🙂" })
})

export default router
