import { RatingModel } from '@repo/common';
import {
  ClassIdentifier,
  RatingIdentifier
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
  if (userRatings.length === 0) return [];
  return formatUserRatings(userRatings);
};

export const getAggregatedRatings = async (
  classIdentifier: ClassIdentifier,
  isAllTime: boolean
) => {
  let ratings;
  if (isAllTime) {
    ratings = await RatingModel.find({
      ...classIdentifier
    });
  } else {
    ratings = await RatingModel.find({
      subject: classIdentifier.subject,
      courseNumber: classIdentifier.courseNumber,
      class: classIdentifier.class
    });
  }
  if (ratings.length === 0) return null;
  return formatClassRatings(ratings);
};

const checkRatingExists = async (context: any, ratingIdentifier: RatingIdentifier) => {
  const existingRating = await RatingModel.findOne({
    ...ratingIdentifier,
    createdBy: context.user._id
  });
  return existingRating;
};

export const createRating = async (
  context: any, 
  ratingIdentifier: RatingIdentifier,
  value: number
) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const existingRating = await checkRatingExists(context, ratingIdentifier);
  if (existingRating) {
    existingRating.value = value;
    return existingRating.save();
  }

  const newRating = new RatingModel({
    ...ratingIdentifier,
    createdBy: context.user._id,
    value
  });
  return newRating.save();
};

export const deleteRating = async (context: any, ratingIdentifier: RatingIdentifier) => {
  if (!context.user._id) throw new Error("Unauthorized");
  const deletedRating = await RatingModel.findOneAndDelete({
    ...ratingIdentifier,
    createdBy: context.user._id
  });
  return deletedRating;
};
