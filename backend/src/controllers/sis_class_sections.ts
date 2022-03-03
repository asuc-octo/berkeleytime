// Berkeley API Central Class API
// https://api-central.berkeley.edu/api/45
import axios from "axios";
import jsondiffpatch from "jsondiffpatch";
import _ from "lodash";
import moment from "moment-timezone";
import PQueue from "p-queue";

import {
  SIS_CLASS_APP_ID,
  SIS_CLASS_APP_KEY,
  URL_SIS_CLASS_SECTIONS_API,
} from "#src/config";
import omitter from "#src/helpers/omitter";
import ts from "#src/helpers/time";
import {
  SIS_Class_Model,
  SIS_Class_Section_Model,
  SIS_Course_Model,
} from "#src/models/_index";
import { ExpressMiddleware } from "#src/types";

import "@colors/colors";

export const SIS_Class_Sections = new (class Controller {
  requestClassSectionDataHandler: ExpressMiddleware<{}, {}> = async (
    req,
    res
  ) => {
    console.info(JSON.stringify(req.user));
    res.json(
      await this.requestClassSectionData({ ...req.query, user: req.user, res })
    );
  };
  requestClassSectionData = async ({
    courseId,
    termId,
  }: {
    courseId: string;
    termId: number;
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
  requestClassSectionDumpHandler: ExpressMiddleware<{}, {}> = async (
    req,
    res
  ) => {
    console.info(JSON.stringify(req.user));
    res.json(await this.requestClassSectionDump({ res }));
  };
  requestClassSectionDump = async ({ res }) => {
    if (res) res.json({ start: moment().tz("America/Los_Angeles") });
    const queue = new PQueue({ concurrency: 10 });
    const shared = {
      sisClassSectionCount: 1,
    };
    const businessLogic = async ({ courseId, termId }) => {
      try {
        const sisClassSections = await this.requestClassSectionData({
          courseId,
          termId,
        });

        for (const sisClassSection of sisClassSections) {
          const original = await SIS_Class_Section_Model.findOne({
            "class.session.term.id": termId,
            id: sisClassSection.id,
          });

          const foundClassSection = original?.toJSON();
          omitter(foundClassSection);
          if (_.isEqual(foundClassSection, sisClassSection)) {
            if (!foundClassSection) {
              // prettier-ignore
              console.error(`WARNING! ONE OF THE IDENTIFIERS HAS A FATAL ERROR: ${JSON.stringify(sisClassSection)}`.red);
            }
            // prettier-ignore
            console.info(`${ts()} SIS CLASS SECTION COUNT: ${shared.sisClassSectionCount}`.padEnd(55, " ") + `no changes: (${original?._id}) cs-course-id '${courseId}' '${foundClassSection?.id}' '${sisClassSection?.displayName}'`.green);
          } else {
            const result = await SIS_Class_Section_Model.findOneAndUpdate(
              {
                "class.session.term.id": termId,
                id: sisClassSection.id,
              },
              sisClassSection,
              {
                lean: true,
                new: true,
                strict: false,
                upsert: true,
                rawResult: true,
              }
            );
            console.info(
              `${ts()} SIS CLASS SECTION COUNT: ${
                shared.sisClassSectionCount
              }`.padEnd(55, " ") +
                `${
                  result?.lastErrorObject.updatedExisting
                    ? //@ts-ignore
                      //prettier-ignore
                      `updated (${result?.value?._id}) cs-course-id '${courseId}' '${sisClassSection?.displayName}' ${JSON.stringify(jsondiffpatch.diff(foundClassSection, sisClassSection))}`.yellow
                    : `created (${result?.lastErrorObject?.upserted}) cs-course-id '${courseId}' '${result?.value?.displayName}'`
                        .yellow
                }`
            );
          }
          shared.sisClassSectionCount++;
        }
      } catch (e) {
        console.error(JSON.stringify(e));
      }
    };

    for await (const sisCourse of SIS_Course_Model.find({
      "status.code": "ACTIVE",
      "identifiers.id": { $ne: "" },
    })
      .sort({ displayName: 1 })
      .batchSize(12)
      .allowDiskUse(true)) {
      const courseId = _.find(sisCourse["identifiers"], {
        type: "cs-course-id",
      }).id;
      const terms = await SIS_Class_Model.distinct("session.term.id", {
        "course.identifiers.id": courseId,
        "session.term.name": RegExp(
          `^(${moment().year()}|${moment().year() + 1})`
        ),
      });
      for (const termId of terms.reverse()) {
        await queue.onSizeLessThan(1000);
        queue.add(() => businessLogic({ courseId, termId }));
      }
    }
    await queue.onEmpty();
  };
})();
