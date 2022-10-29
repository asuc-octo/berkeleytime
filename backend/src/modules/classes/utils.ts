import { EnrollmentInfo } from "../../generated-types/graphql";
import { SisClassHistory } from "./model";

/**
 * Construct enrollment info from SisClassHistory. Populates missing fields of the current
 * SisClass with the last known value.
 *
 * @param sisClassHistory Mongoose history model
 * @returns EnrollmentInfo gql schema
 */
export function constructEnrollment(
  sisClassHistory: SisClassHistory[]
): EnrollmentInfo[] {
  const enrollmentInfo: EnrollmentInfo[] = [];

  let enrolledMax = 0;
  let waitlistedMax = 0;
  let enrolledCount = 0;
  let waitlistedCount = 0;

  for (const classHistory of sisClassHistory) {
    enrolledMax =
      classHistory.diff?.aggregateEnrollmentStatus?.maxEnroll[1] || enrolledMax;
    waitlistedMax =
      classHistory.diff?.aggregateEnrollmentStatus?.maxWaitlist[1] ||
      waitlistedMax;
    enrolledCount =
      classHistory.diff?.aggregateEnrollmentStatus?.enrolledCount[1] ||
      enrolledCount;
    waitlistedCount =
      classHistory.diff?.aggregateEnrollmentStatus?.waitlistedCount[1] ||
      waitlistedCount;

    enrollmentInfo.push({
      enrolledMax,
      waitlistedMax,
      enrolledCount,
      waitlistedCount,
      date: classHistory.createdAt,
    });
  }

  return enrollmentInfo;
}
