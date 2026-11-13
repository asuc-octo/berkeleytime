import { type CourseListing, computeFormerNames } from "@repo/common";
import { ClassModel, CourseModel } from "@repo/common/models";

import { Config } from "../shared/config";

const sameNames = (a: string[] | undefined, b: string[]) =>
  (a ?? []).length === b.length && b.every((name, i) => a?.[i] === name);

/**
 * Recomputes `formerNames` and `formerNameKeys` on every course from the
 * classes collection. Runs after the courses and classes pullers, since either
 * can change a course's former names.
 */
export const updateCourseFormerNames = async (log: Config["log"]) => {
  log.trace("Computing course former names...");

  const [listings, courses] = await Promise.all([
    ClassModel.aggregate<{
      _id: CourseListing & { courseId: string };
      termIds: string[];
    }>([
      {
        $group: {
          _id: {
            courseId: "$courseId",
            subject: "$subject",
            courseNumber: "$courseNumber",
          },
          termIds: { $addToSet: "$termId" },
        },
      },
    ]),
    CourseModel.find(
      {},
      {
        courseId: 1,
        subject: 1,
        number: 1,
        printInCatalog: 1,
        formerNames: 1,
        formerNameKeys: 1,
      }
    ).lean(),
  ]);

  const results = computeFormerNames(
    listings.map(({ _id, termIds }) => ({ ..._id, termIds })),
    courses
  );

  const updates = courses.flatMap((course, i) => {
    const { formerNames, formerNameKeys } = results[i];
    if (
      sameNames(course.formerNames, formerNames) &&
      sameNames(course.formerNameKeys, formerNameKeys)
    )
      return [];

    return [
      {
        updateOne: {
          filter: { _id: course._id },
          update: { $set: { formerNames, formerNameKeys } },
        },
      },
    ];
  });

  const batchSize = 5000;
  for (let i = 0; i < updates.length; i += batchSize) {
    await CourseModel.bulkWrite(updates.slice(i, i + batchSize));
  }

  log.info(
    `Updated former names on ${updates.length.toLocaleString()} of ${courses.length.toLocaleString()} courses.`
  );
};
