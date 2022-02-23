// Berkeley API Central Class API
// https://api-central.berkeley.edu/api/45
import axios from "axios";
import _ from "lodash";
import moment from "moment-timezone";
import PQueue from "p-queue";

import {
  SIS_CLASS_APP_ID,
  SIS_CLASS_APP_KEY,
  URL_SIS_CLASS_API,
} from "#src/config";
import omitter from "#src/helpers/omitter";
import ts from "#src/helpers/time";
import { SIS_Class, SIS_Course } from "#src/models/_index";
import { ExpressMiddleware } from "#src/types";

export const SIS_Classes = new (class Controller {
  requestClassDataHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    console.info(JSON.stringify(req.user));
    res.json(await this.requestClassData({ ...req.query, user: req.user }));
  };
  requestClassData = async ({ courseId }: { courseId: string; user?: any }) => {
    let pageNumber = 1;
    let sisClasses = [];
    let sisResponse;
    const pageSize = 200;
    do {
      // SIS Class API is shitty and will 500 error if their payload is too large, so we use 'page-size', but also a too-large page size will error
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
      });

      sisClasses = sisClasses.concat(
        sisResponse.data?.apiResponse?.response?.classes
      );
    } while (
      sisResponse.data?.apiResponse?.response?.classes?.length == pageSize &&
      pageNumber++ < Infinity
    );
    return _.chain(sisClasses)
      .orderBy((sisClass) => sisClass.session.term.id, ["desc"])
      .filter(
        (value) =>
          value.session.term.name.includes(moment().year() - 1) ||
          value.session.term.name.includes(moment().year()) ||
          value.session.term.name.includes(moment().year() + 1)
      )
      .value();
  };
  requestClassDumpHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    console.info(JSON.stringify(req.user));
    res.json(await this.requestClassDump());
  };
  requestClassDump = async () => {
    const start = moment().tz("America/Los_Angeles");
    const queue = new PQueue({ concurrency: 10 });
    const shared = {
      sisClassCount: 1,
      sisCourseCount: 1,
    };
    try {
      for await (const sisCourse of SIS_Course.find({
        "status.code": "ACTIVE",
        identifiers: { $ne: { type: "cs-course-id", id: "" } },
      })
        .sort({ displayName: 1 })
        .allowDiskUse(true)) {
        const businessLogic = async (sisCourse) => {
          let sisClasses;
          const courseId = _.find(sisCourse.identifiers, {
            type: "cs-course-id",
          }).id;
          try {
            sisClasses = await this.requestClassData({
              courseId,
            });
          } catch (e) {
            if (e.response?.data?.apiResponse?.httpStatus) {
              // prettier-ignore
              console.error(`${ts()} SIS CLASS COUNT: ${shared.sisClassCount}`.padEnd(55, " ") + `FAILED cs-course-id '${courseId}' '${sisCourse.displayName}' '${sisCourse.title}', ${JSON.stringify(e.response.data.apiResponse.httpStatus)}`.red);
            } else {
              // prettier-ignore
              console.error(`${ts()} SIS CLASS COUNT: ${shared.sisClassCount}`.padEnd(55, " ") + `FAILED cs-course-id '${courseId}' '${sisCourse.displayName}' '${sisCourse.title}', UNHANDLED EXCEPTION: ${e}`.red);
            }
            shared.sisClassCount++;
            return;
          }
          for (const sisClass of sisClasses) {
            const original = await SIS_Class.findOne({
              "course.displayName": sisClass.course.displayName,
              "course.identifiers": sisClass.course.identifiers,
              "session.id": sisClass.session.id,
              "session.term.id": sisClass.session.term.id,
              number: sisClass.number,
            });
            const foundClass = original?.toJSON();
            omitter(foundClass);
            if (_.isEqual(foundClass, sisClass)) {
              // prettier-ignore
              console.info(`${ts()} SIS CLASS COUNT: ${shared.sisClassCount}`.padEnd(55, " ") + `no changes: (${original?._id}) cs-course-id '${courseId}' '${sisClass?.displayName}' / '${sisClass?.course?.title}'`.green);
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
              );
              console.info(
                `${ts()} SIS CLASS COUNT: ${shared.sisClassCount}`.padEnd(
                  55,
                  " "
                ) +
                  `${
                    result.lastErrorObject.updatedExisting
                      ? //@ts-ignore
                        //prettier-ignore
                        `updated (${result.value._id}) cs-course-id '${courseId}' '${result.value.displayName}' '${result.value.course.title}' ${JSON.stringify((await SIS_Class.history.find({collectionId:result.value._id}).sort({updatedAt:"desc"}).limit(1))[0])}`.yellow
                      : `created (${result.lastErrorObject.upserted}) cs-course-id '${courseId}' '${result.value["displayName"]}' '${result.value["course"]["title"]}'`
                          .yellow
                  }`
              );
            }
            shared.sisClassCount++;
          }
          console.info(`courses: ${shared.sisCourseCount}`);
          shared.sisCourseCount++;
        };

        queue.add(() => businessLogic(sisCourse));
      }
      await queue.onEmpty();
    } catch (err) {
      console.error(err);
    }
    return { start, finish: moment().tz("America/Los_Angeles") };
  };
})();
