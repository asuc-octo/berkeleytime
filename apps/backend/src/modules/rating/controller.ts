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

  return true;
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

// example return value:
// {
//   createdBy: "Pine",
//   count: 2,
//   classes: [
//     {
//       subject: "COMPSCI",
//       courseNumber: "1001",
//       semester: "FALL",
//       year: 2023,
//       class: "61B",
//       metrics: [
//         { metricName: "Difficulty", value: 4 },
//         { metricName: "Workload", value: 3 },
//         { metricName: "Usefulness", value: 5 },
//         { metricName: "Attendance", value: 0 }
//         { metricName: "Recording", value: 1 }
//       ]
//     },
//     {
//       subject: "DATA",
//       courseNumber: "1002",
//       semester: "SPRING",
//       year: 2024,
//       class: "140",
//       metrics: [
//         { metricName: "Difficulty", value: 5 },
//         { metricName: "Recording", value: 0 }
//       ]
//     }
//   ],
// }
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
        },
        totalCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        createdBy: "$_id.createdBy",
        count: "$totalCount",
        classes: 1
      }
    }
  ]);
};

// example return value:
// {
//   subject: "COMPSCI",
//   courseNumber: "1003",
//   semester: "FALL",
//   year: 2023,
//   class: "70",
//   metrics: [
//     {
//       metricName: "Difficulty",
//       count: 521,
//       mean: 3.8,
//       categories: [
//         { value: "5", count: 10 },
//         { value: "4", count: 15 },
//         { value: "3", count: 10 },
//         { value: "2", count: 5 },
//         { value: "1", count: 5 }
//       ]
//     },
//     {
//       metricName: "Workload",
//       count: 452,
//       mean: 4.2,
//       categories: [
//         { value: "5", count: 15 },
//         { value: "4", count: 12 },
//         { value: "3", count: 10 },
//         { value: "2", count: 50 },
//         { value: "1", count: 5 }
//       ]
//     },
//   ]
// }
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