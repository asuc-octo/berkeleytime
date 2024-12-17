import { RatingModel, UserModel } from "@repo/common";
import { USER_MAX_RATINGS } from "@repo/shared";

import { MetricName } from "../../../generated-types/graphql";
import { booleanScaleMetrics, numberScaleMetrics } from "../controller";

export const checkRatingExists = async (
  context: any,
  subject: string,
  courseNumber: string,
  metricName: MetricName
) => {
  return await RatingModel.findOne({
    subject,
    courseNumber,
    metricName,
    createdBy: context.user._id,
  });
};

export const checkUserClassRatingsCount = async (context: any) => {
  const user = await UserModel.findOne({ googleId: context.user.googleId });
  return (user?.classRatingsCount || 0) < USER_MAX_RATINGS;
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
