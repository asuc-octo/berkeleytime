import { RatingModel } from '@repo/common';
import {
  ClassIdentifier,
  MetricName,
  RatingIdentifier
} from "../../generated-types/graphql";
import {
  formatUserRatings,
  formatAggregatedRatings
} from "./formatter";

export const createRating = async (
  context: any, 
  ratingIdentifier: RatingIdentifier,
  value: number
) => {
  if (!context.user._id) throw new Error("Unauthorized");
  checkValueConstraint(ratingIdentifier.metricName, value);
  const existingRating = await checkRatingExists(context, ratingIdentifier);
  if (existingRating) {
    existingRating.value = value;
    await existingRating.save();
  }
  else {
    await RatingModel.create({
      ...ratingIdentifier,
      createdBy: context.user._id,
      value: value
    });
  }
  const aggregated = await ratingAggregator(ratingIdentifier);
  if (!aggregated.length) return null;
  
  return formatAggregatedRatings(aggregated[0]);
};

export const deleteRating = async (context: any, ratingIdentifier: RatingIdentifier) => {
  if (!context.user._id) throw new Error("Unauthorized");

  await RatingModel.findOneAndDelete({
    ...ratingIdentifier,
    createdBy: context.user._id
  });

  const aggregated = await ratingAggregator(ratingIdentifier);
  if (!aggregated.length) return null;

  return formatAggregatedRatings(aggregated[0]);
};

export const getUserRatings = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const userRatings = await userRatingAggregator(context);
  if (!userRatings.length) return null;

  return formatUserRatings(userRatings[0]);
};

export const getAggregatedRatings = async (
  classIdentifier: ClassIdentifier,
  isAllTime: boolean
) => {
  let filter;
  if (isAllTime) {
    filter = classIdentifier;
  } else {
    filter = {
      subject: classIdentifier.subject,
      courseNumber: classIdentifier.courseNumber,
      class: classIdentifier.class
    };
  }
  const aggregated = await ratingAggregator(filter);
  if (!aggregated.length) return null;

  return formatAggregatedRatings(aggregated[0]);
};

// Helper functions

const checkRatingExists = async (context: any, ratingIdentifier: RatingIdentifier) => {
  return await RatingModel.findOne({
    ...ratingIdentifier,
    createdBy: context.user._id
  });
};

const checkValueConstraint = (metricName: MetricName, value: number) => {
  const numberScaleMetrics = ['Usefulness', 'Difficulty', 'Workload'] as const;
  const booleanScaleMetrics = ['Attendance', 'Recording'] as const; 

  if (numberScaleMetrics.includes(metricName as typeof numberScaleMetrics[number])) {
    if (value < 1 || value > 5 || !Number.isInteger(value)) {
      throw new Error(`${metricName} rating must be an integer between 1 and 5`);
    }
  } else if (booleanScaleMetrics.includes(metricName as typeof booleanScaleMetrics[number])) {
    if (value !== 0 && value !== 1) {
      throw new Error(`${metricName} rating must be either 0 or 1`);
    }
  }
}

const userRatingAggregator = async (context: any) => {
  return await RatingModel.aggregate([
    { $match: { createdBy: context.user._id } },
    {
      $group: {
        _id: {
          createdBy: "$createdBy",
          subject: "$subject",
          courseNumber: "$courseNumber",
          semester: "$semester",
          year: "$year",
          class: "$class",
        },
        metrics: {
          $push: {
            metricName: "$metricName",
            value: "$value"
          }
        }
      }
    },
    {
      $group: {
        _id: {
          createdBy: "$_id.createdBy"
        },
        classes: {
          $push: {
            subject: "$_id.subject",
            courseNumber: "$_id.courseNumber",
            semester: "$_id.semester",
            year: "$_id.year",
            class: "$_id.class",
            metrics: "$metrics"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        createdBy: "$_id.createdBy",
        classes: 1
      }
    }
  ]);
};

const ratingAggregator = async (filter: any) => {
  return await RatingModel.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          subject: "$subject",
          courseNumber: "$courseNumber",
          semester: "$semester",
          year: "$year",
          class: "$class",
          metricName: "$metricName",
          category: "$category"
        },
        categoryCount: { $sum: 1 },
        values: { $push: "$value" }
      }
    },
    {
      $group: {
        _id: {
          subject: "$_id.subject",
          courseNumber: "$_id.courseNumber",
          semester: "$_id.semester",
          year: "$_id.year",
          class: "$_id.class",
          metricName: "$_id.metricName"
        },
        totalCount: { $sum: "$categoryCount" },
        sumValues: { $sum: { $sum: "$values" } },
        categories: {
          $push: {
            value: "$_id.category",
            count: "$categoryCount"
          }
        }
      }
    },
    {
      $addFields: {
        mean: { $divide: ["$sumValues", "$totalCount"] }
      }
    },
    {
      $group: {
        _id: {
          subject: "$_id.subject",
          courseNumber: "$_id.courseNumber",
          semester: "$_id.semester",
          year: "$_id.year",
          class: "$_id.class"
        },
        metrics: {
          $push: {
            metricName: "$_id.metricName",
            count: "$totalCount",
            mean: "$mean",
            categories: "$categories"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        subject: "$_id.subject",
        courseNumber: "$_id.courseNumber",
        semester: "$_id.semester",
        year: "$_id.year",
        class: "$_id.class",
        metrics: 1
      }
    }
  ]);
};