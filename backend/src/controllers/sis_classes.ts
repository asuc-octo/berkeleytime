// Berkeley API Central Class API
// https://api-central.berkeley.edu/api/45
import axios from "axios";
import _ from "lodash";
import moment from "moment-timezone";
import mongoose from "mongoose";
import PQueue from "p-queue";

import {
  SIS_CLASS_APP_ID,
  SIS_CLASS_APP_KEY,
  URL_SIS_CLASS_API,
  URL_SIS_CLASS_SECTIONS_API,
} from "#src/config";
import { SIS_Class, SIS_Class_Section, SIS_Course } from "#src/models/_index";
import { ExpressMiddleware } from "#src/types";

export const SIS_Classes = new (class Controller {
  requestClassDataHandler: ExpressMiddleware<{}, {}> = async (req, res) => {
    res.json(await this.requestClassData({ ...req.query, user: req.user }));
  };
  requestClassSectionDataHandler: ExpressMiddleware<{}, {}> = async (
    req,
    res
  ) => {
    res.json(
      await this.requestClassSectionData({ ...req.query, user: req.user })
    );
  };

  requestClassData = async ({ courseId }: { courseId: string; user?: any }) => {
    let sisClasses = [];
    let pageNumber = 1;
    let sisResponse;
    const pageSize = 200;
    do {
      // SIS Class API is really shitty and will 500 error if their payload is too large, so we use 'page-size', but also a too-large page size will error
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
          value.session.term.name.includes(moment().year()) ||
          value.session.term.name.includes(moment().year() + 1)
      )
      .value();
  };

  requestClassSectionData = async ({
    courseId,
    termId,
  }: {
    courseId: string;
    termId: number;
    user?: any;
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
    });
    return sisResponse.data?.apiResponse?.response?.classSections;
  };

  requestClassSectionDump: ExpressMiddleware<{}, {}> = async (req, res) => {
    const queue = new PQueue({ concurrency: 10 });
    const shared = {
      sisClassSectionCount: 1,
    };
    for await (const sisCourse of SIS_Course.find({
      "status.code": "ACTIVE",
      identifiers: { $ne: { type: "cs-course-id", id: "" } },
    }).sort({ displayName: 1 })) {
      const courseId = _.find(sisCourse["identifiers"], {
        type: "cs-course-id",
      }).id;
      const terms = await SIS_Class.find({
        "course.identifiers": { type: "cs-course-id", id: courseId },
        "session.term.name": RegExp(
          `${moment().year()}|${moment().year() + 1}`
        ),
      }).distinct("session.term.id");
      for (let termId of terms.reverse()) {
        try {
          const businessLogic = async () => {
            const sisClassSections = await this.requestClassSectionData({
              courseId,
              termId,
            });

            for (let classSection of sisClassSections) {
              const foundClassSection: any = await SIS_Class_Section.findOne({
                "class.session.term.id": termId,
                id: classSection.id,
              });

              if (
                _.isEqual(
                  _.without(foundClassSection, undefined),
                  _.without(classSection, undefined)
                )
              ) {
                if (!foundClassSection) {
                  // prettier-ignore
                  console.error(`WARNING! ONE OF THE IDENTIFIERS HAVE A FATAL ERROR: ${JSON.stringify(classSection)}`.red);
                }
                // prettier-ignore
                console.info(`${moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`)} SIS CLASS SECTION COUNT: ${shared.sisClassSectionCount}`.padEnd(55, " ") + `no changes: (${foundClassSection?._id}) cs-course-id '${courseId}' '${foundClassSection?.id}' '${classSection["displayName"]}'`
                );
              } else {
                const result = await SIS_Class_Section.findOneAndUpdate(
                  {
                    "class.session.term.id": termId,
                    id: classSection.id,
                  },
                  classSection,
                  {
                    lean: true,
                    new: true,
                    strict: false,
                    upsert: true,
                    rawResult: true,
                  }
                );
                console.info(
                  `${moment()
                    .tz("America/Los_Angeles")
                    .format(`YYYY-MM-DD HH-mm-ss`)} SIS CLASS SECTION COUNT: ${
                    shared.sisClassSectionCount
                  }`.padEnd(55, " ") +
                    `${
                      result.lastErrorObject.updatedExisting
                        ? //@ts-ignore
                          //prettier-ignore
                          `updated (${result.value._id}) cs-course-id '${courseId}' '${classSection.displayName} ${JSON.stringify((await SIS_Class_Section.history.find({collectionId:result.value._id}).sort({updatedAt:"desc"}).limit(1))[0])+"\n"}'`
                        : `created (${result.lastErrorObject.upserted}) cs-course-id '${courseId}' '${result.value["displayName"]}'`
                    }`
                );
              }
              shared.sisClassSectionCount++;
            }
          };
          queue.add(() => businessLogic());
        } catch (e) {
          console.error(JSON.stringify(e));
        }
      }
    }
    res.json({ message: "finished" });
  };

  requestClassDump: ExpressMiddleware<{}, {}> = async (req, res) => {
    const queue = new PQueue({ concurrency: 10 });
    const shared = {
      sisClassCount: 1,
      sisCourseCount: 1,
    };
    try {
      for await (const sisCourse of SIS_Course.find({
        "status.code": "ACTIVE",
        identifiers: { $ne: { type: "cs-course-id", id: "" } },
      }).sort({ displayName: 1 })) {
        const businessLogic = async (sisCourse) => {
          const courseId = _.find(sisCourse.identifiers, {
            type: "cs-course-id",
          }).id;
          let sisClasses;
          try {
            sisClasses = await this.requestClassData({
              courseId,
            });
          } catch (e) {
            if (e.response?.data?.apiResponse?.httpStatus) {
              console.error(
                `${moment()
                  .tz("America/Los_Angeles")
                  .format(`YYYY-MM-DD HH-mm-ss`)} SIS CLASS COUNT: ${
                  shared.sisClassCount
                }`.padEnd(55, " ") +
                  `FAILED cs-course-id '${courseId}' '${
                    sisCourse.displayName
                  }' '${sisCourse.title}', ${JSON.stringify(
                    e.response.data.apiResponse.httpStatus
                  )}`
              );
            } else {
              console.error(
                `${moment()
                  .tz("America/Los_Angeles")
                  .format(`YYYY-MM-DD HH-mm-ss`)} SIS CLASS COUNT: ${
                  shared.sisClassCount
                }`.padEnd(55, " ") +
                  `FAILED cs-course-id '${courseId}' '${sisCourse.displayName}' '${sisCourse.title}', UNHANDLED EXCEPTION: ${e}`
              );
            }
            shared.sisClassCount++;
            return;
          }
          for (let sisClass of sisClasses) {
            const foundClass: any = await SIS_Class.findOne({
              "course.displayName": sisClass.course.displayName,
              "course.identifiers": sisClass.course.identifiers,
              "session.id": sisClass.session.id,
              "session.term.id": sisClass.session.term.id,
              number: sisClass.number,
            });

            if (
              _.isEqual(
                _.without(foundClass, undefined),
                _.without(sisClass, undefined)
              )
            ) {
              console.info(
                `${moment()
                  .tz("America/Los_Angeles")
                  .format(`YYYY-MM-DD HH-mm-ss`)} SIS CLASS COUNT: ${
                  shared.sisClassCount
                }`.padEnd(55, " ") +
                  `no changes: (${foundClass._id}) cs-course-id '${courseId}' '${sisClass.displayName}' / '${sisClass.course.title}'`
              );
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
                `${moment()
                  .tz("America/Los_Angeles")
                  .format(`YYYY-MM-DD HH-mm-ss`)} SIS CLASS COUNT: ${
                  shared.sisClassCount
                }`.padEnd(55, " ") +
                  `${
                    result.lastErrorObject.updatedExisting
                      ? //@ts-ignore
                        //prettier-ignore
                        `updated (${result.value._id}) cs-course-id '${courseId}' '${result.value.displayName}' '${result.value.course.title}' ${JSON.stringify((await SIS_Class.history.find({collectionId:result.value._id}).sort({updatedAt:"desc"}).limit(1))[0])}`
                      : `created (${result.lastErrorObject.upserted}) cs-course-id '${courseId}' '${result.value["displayName"]}' '${result.value["course"]["title"]}'`
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
      res.json({ message: "finished" });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
})();
