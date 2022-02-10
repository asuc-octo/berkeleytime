// API Central Berkeley Class API
// https://api-central.berkeley.edu/api/45
import axios from "axios"
import _ from "lodash"
import moment from "moment-timezone"

import {
  SIS_CLASS_APP_ID,
  SIS_CLASS_APP_KEY,
  URL_SIS_CLASS_API,
  URL_SIS_CLASS_SECTIONS_API,
} from "#src/config"
import { SIS_Class, SIS_Course } from "#src/models/_index"
import { ExpressMiddleware } from "#src/types"

export const SIS_Classes = new (class Controller {
  requestClassDataHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    res.json(await this.requestClassData({ ...req.query, user: req.user }))
  }
  requestClassSectionDataHandler: ExpressMiddleware<{}, {}> = async (
    req,
    res
  ) => {
    res.json(
      await this.requestClassSectionData({ ...req.query, user: req.user })
    )
  }

  requestClassData = async ({ courseId }: { courseId: string; user?: any }) => {
    let sisClasses = []
    let pageNumber = 1
    let sisResponse
    const pageSize = 200
    do {
      // SIS Class API is really shitty and will 500 error if the payload is too large, so we use 'page-size', but also a too-large page size will error
      sisResponse = await axios.get(`${URL_SIS_CLASS_API}`, {
        headers: {
          app_id: SIS_CLASS_APP_ID,
          app_key: SIS_CLASS_APP_KEY,
        },
        params: {
          "cs-course-id": courseId,
          "page-number": pageNumber,
          "page-size": 200,
        },
      })

      sisClasses = sisClasses.concat(
        sisResponse.data?.apiResponse?.response?.classes
      )
    } while (
      sisResponse.data?.apiResponse?.response?.classes?.length == pageSize &&
      pageNumber++ < Infinity
    )
    return _.chain(sisClasses)
      .orderBy((sisClass) => sisClass.session.term.id, ["desc"])
      .filter(
        (value) =>
          value.session.term.name.includes(moment().year().toString()) ||
          value.session.term.name.includes((moment().year() + 1).toString())
      )
      .value()
  }

  requestClassSectionData = async ({
    courseId,
    termId,
  }: {
    courseId: string
    termId: string
    user?: any
  }) => {
    const sisResponse = await axios.get(`${URL_SIS_CLASS_SECTIONS_API}`, {
      headers: {
        app_id: SIS_CLASS_APP_ID,
        app_key: SIS_CLASS_APP_KEY,
      },
      params: {
        "cs-course-id": courseId,
        "term-id": termId,
      },
    })
    return sisResponse.data.apiResponse.response.classSections
  }

  requestClassDump: ExpressMiddleware<{}, {}> = async (req, res) => {
    try {
      let sisCourseCount = 1
      let sisClassCount = 1
      res.json({ message: "started" })
      for await (const sisCourse of SIS_Course.find({
        "status.code": "ACTIVE",
        identifiers: { $eq: { type: "cs-course-id", id: "" } },
      })) {
        const ts = moment()
          .tz("America/Los_Angeles")
          .format(`YYYY-MM-DD HH-mm-ss`)
        const courseId = _.find(sisCourse.identifiers, {
          type: "cs-course-id",
        }).id
        let sisClasses
        try {
          sisClasses = await this.requestClassData({
            courseId,
          })
        } catch (e) {
          if (e.response?.data?.apiResponse?.httpStatus) {
            console.error(
              `${ts} SIS CLASS COUNT: ${sisClassCount}`.padEnd(50, " ") +
                `FAILED cs-course-id '${courseId}' '${
                  sisCourse.displayName
                }' '${sisCourse.title}', ${JSON.stringify(
                  e.response.data.apiResponse.httpStatus
                )}`
            )
          } else {
            console.error(
              `${ts} SIS CLASS COUNT: ${sisClassCount}`.padEnd(50, " ") +
                `FAILED cs-course-id '${courseId}' '${sisCourse.displayName}' '${sisCourse.title}', UNHANDLED EXCEPTION: ${e}`
            )
          }
          sisClassCount++
          continue
        }
        for (let sisClass of sisClasses) {
          const foundClass = await SIS_Class.findOne({
            "course.displayName": sisClass.course.displayName,
            "course.identifiers": sisClass.course.identifiers,
            "session.id": sisClass.session.id,
            "session.term.id": sisClass.session.term.id,
            number: sisClass.number,
          })
          if (_.isEqual(foundClass?.toJSON(), sisClass)) {
            console.info(
              `${ts} SIS CLASS COUNT: ${sisClassCount}`.padEnd(50, " ") +
                `no changes: (${foundClass.id}) cs-course-id '${courseId}' '${sisClass.displayName}' / '${sisClass.course.title}'`
            )
          } else {
            const result = await SIS_Class.findOneAndUpdate(
              {
                "course.displayName": sisClass.course.displayName,
                "course.identifiers": sisClass.course.identifiers,
                "session.id": sisClass.session.id,
                "session.term.id": sisClass.session.term.id,
                number: sisClass.number,
              },
              sisClass,
              {
                lean: true,
                new: true,
                strict: false,
                upsert: true,
                rawResult: true,
              }
            )
            console.info(
              `${ts} SIS CLASS COUNT: ${sisClassCount}`.padEnd(50, " ") +
                `${
                  result.lastErrorObject.updatedExisting
                    ? `updated (${result.value._id}) cs-course-id '${courseId}' '${result.value.displayName}' '${result.value.course.title}'`
                    : `created (${result.lastErrorObject.upserted}) cs-course-id '${courseId}' '${result.value.displayName}' '${result.value.course.title}'`
                }`
            )
          }
          sisClassCount++
        }
        console.info(`courses: ${sisCourseCount}`)
        sisCourseCount++
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }
})()
