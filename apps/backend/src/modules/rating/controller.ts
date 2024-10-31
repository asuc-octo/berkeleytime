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

  const numberScaleMetrics = ['Usefulness', 'Difficulty', 'Workload'] as const;
  const booleanScaleMetrics = ['Attendance', 'Recording'] as const;

  if (numberScaleMetrics.includes(ratingIdentifier.metricName as typeof numberScaleMetrics[number])) {
    if (value < 1 || value > 5 || !Number.isInteger(value)) {
      throw new Error(`${ratingIdentifier.metricName} rating must be an integer between 1 and 5`);
    }
  } else if (booleanScaleMetrics.includes(ratingIdentifier.metricName as typeof booleanScaleMetrics[number])) {
    if (value !== 0 && value !== 1) {
      throw new Error(`${ratingIdentifier.metricName} rating must be either 0 or 1`);
    }
  }
  // potentially enforece value at mongodb level? - models file

  const existingRating = await checkRatingExists(context, ratingIdentifier);
  if (existingRating) {
    existingRating.value = value;
    return existingRating.save();
  }

  // potential vunerability with rating identifier?
  const newRating = new RatingModel({
    ...ratingIdentifier,
    createdBy: context.user._id,
    value: value
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
