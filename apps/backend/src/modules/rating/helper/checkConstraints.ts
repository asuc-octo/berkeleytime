import { GraphQLError } from "graphql";

import { RatingModel, RatingType } from "@repo/common/models";
import { USER_MAX_ALL_RATINGS, USER_MAX_SEMESTER_RATINGS } from "@repo/shared";

import {
  MetricName,
  Semester,
  UserRatings,
} from "../../../generated-types/graphql";
import {
  RequestContext,
  booleanScaleMetrics,
  numberScaleMetrics,
} from "../controller";

export const checkRatingExists = async (
  context: RequestContext,
  subject: string,
  courseNumber: string,
  metricName: MetricName
): Promise<RatingType | null> => {
  const rating = await RatingModel.findOne({
    createdBy: context.user._id,
    subject,
    courseNumber,
    metricName,
  });

  // null check and return null, otherwise cast into RatingType and return that
  return rating ? (rating as RatingType) : null;
};

{
  /* // TODO: [CROWD-SOURCED-DATA] create pipline for showing error on frontend */
}
export const checkUserMaxRatingsConstraint = async (
  userRatings: UserRatings,
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string
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
    throw new GraphQLError(`User has reached the maximum number of ratings`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  const ratingsInSemester = filteredUserRatings.classes.filter(
    (userClass) => userClass.semester === semester && userClass.year === year
  );
  if (ratingsInSemester.length >= USER_MAX_SEMESTER_RATINGS) {
    throw new GraphQLError(
      `User has reached the maximum number of ratings in this term`,
      {
        extensions: { code: "BAD_USER_INPUT" },
      }
    );
  }
};

export const checkValueConstraint = (metricName: MetricName, value: number) => {
  if (numberScaleMetrics.includes(metricName)) {
    if (value < 1 || value > 5 || !Number.isInteger(value)) {
      throw new GraphQLError(
        `${metricName} rating must be an integer between 1 and 5`,
        {
          extensions: { code: "BAD_USER_INPUT" },
        }
      );
    }
  } else if (booleanScaleMetrics.includes(metricName)) {
    if (value !== 0 && value !== 1) {
      throw new GraphQLError(`${metricName} rating must be either 0 or 1`, {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
  }
};
