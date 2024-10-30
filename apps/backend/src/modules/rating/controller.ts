import { RatingModel } from '@repo/common';
import {
  ClassIdentifier
} from "../../generated-types/graphql";
import {
  formatUserRatings,
  formatClassRatings
} from "./formatter";

// graphql -> mongodb -> formatter
export const getUserRatings = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const userRatings = await RatingModel.find({
    createdBy: context.user._id
  });

  return formatUserRatings(userRatings);
};

export const getAggregatedRatings = async (
  classIdentifier: ClassIdentifier,
  isAllTime: boolean
) => {
  let ratings;
  if (isAllTime) {
    ratings = await RatingModel.find({
      subject: classIdentifier.subject,
      courseNumber: classIdentifier.courseNumber,
      semester: classIdentifier.semester,
      year: classIdentifier.year,
      class: classIdentifier.class,
    });
  } else {
    ratings = await RatingModel.find({
      subject: classIdentifier.subject,
      courseNumber: classIdentifier.courseNumber,
      class: classIdentifier.class
    });
  }

  return formatClassRatings(ratings);
};
