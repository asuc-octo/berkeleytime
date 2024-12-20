import { RatingModel } from "@repo/common";
import { USER_MAX_ALL_RATINGS, USER_MAX_SEMESTER_RATINGS } from "@repo/shared";

import { MetricName, UserRatings } from "../../../generated-types/graphql";
import { booleanScaleMetrics, numberScaleMetrics } from "../controller";

export const checkRatingExists = async (
  context: any,
  subject: string,
  courseNumber: string,
  metricName: MetricName
) => {
  return RatingModel.findOne({
    createdBy: context.user._id,
    subject,
    courseNumber,
    metricName,
  });
};

export const checkUserMaxRatingsContraint = async (
  userRatings: UserRatings,
  subject: string,
  courseNumber: string,
  semester: string,
  year: number
) => {
  const filteredClasses = userRatings.classes.filter(
    (userClass) =>
      !(
        userClass.subject === subject && userClass.courseNumber === courseNumber
      )
  );
  const filteredUserRatings = {
    ...userRatings,
    classes: filteredClasses,
    count: filteredClasses.length,
  };
  if (filteredUserRatings.count >= USER_MAX_ALL_RATINGS) {
    throw new Error(`User has reached the maximum number of ratings`);
  }
  const ratingsInSemester = filteredUserRatings.classes.filter(
    (userClass) => userClass.semester === semester && userClass.year === year
  );
  if (ratingsInSemester.length >= USER_MAX_SEMESTER_RATINGS) {
    throw new Error(
      `User has reached the maximum number of ratings in this term`
    );
  }
};

export const checkValueConstraint = (metricName: MetricName, value: number) => {
  if (numberScaleMetrics.includes(metricName)) {
    if (value < 1 || value > 5 || !Number.isInteger(value)) {
      throw new Error(
        `${metricName} rating must be an integer between 1 and 5`
      );
    }
  } else if (booleanScaleMetrics.includes(metricName)) {
    if (value !== 0 && value !== 1) {
      throw new Error(`${metricName} rating must be either 0 or 1`);
    }
  }
};
