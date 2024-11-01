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

// TODO: get list of all avaiable semesters with ratings (check for class offered?)
// TODO: get list of all available semesters class offered in
// TODO: get user ratings for given class

export const createRating = async (
  context: any, 
  ratingIdentifier: RatingIdentifier,
  email: string,
  value: number
) => {
  if (!context.user._id) throw new Error("Unauthorized");
  checkValueConstraint(ratingIdentifier.metricName, value);

  const existingRating = await checkRatingExists(context, ratingIdentifier);
  if (existingRating) {
    existingRating.value = value;
    await existingRating.save();
  }

  // TODO: add ratechecking for user (get timestamps of most recent ratings)

  else {
    await RatingModel.create({
      createdBy: context.user._id,
      email: email,
      ...ratingIdentifier,
      value: value
    });
  }
  const aggregated = await ratingAggregator(ratingIdentifier);
  if (!aggregated.length) return null;
  
  return formatAggregatedRatings(aggregated[0]);
};

export const deleteRating = async (
  context: any, 
  ratingIdentifier: RatingIdentifier
) => {
  if (!context.user._id) throw new Error("Unauthorized");

  await RatingModel.findOneAndDelete({
    createdBy: context.user._id,
    ...ratingIdentifier,
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

const userRatingAggregator = async (context: any) => {
  return await RatingModel.aggregate([
    { $match: { createdBy: context.user._id } },
    {
      $group: {
        _id: {
          createdBy: "$createdBy",
          email: "$email",
          subject: "$subject",
          courseNumber: "$courseNumber",
          semester: "$semester",
          year: "$year",
          class: "$class",
        },
        metrics: {
          $push: {
            metricName: "$metricName",
            value: "$value",
            // updatedAt: "$updatedAt" - not sure how to do the typedef
          }
        }
      }
    },
    {
      $group: {
        _id: {
          createdBy: "$_id.createdBy",
          email: "$_id.email"
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
        email: "$_id.email",
        createdBy: "$_id.createdBy",
        count: "$totalCount",
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
        weightedAverage: { $divide: ["$sumValues", "$totalCount"] }
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
            weightedAverage: "$weightedAverage",
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
        metrics: {
          $map: {
            input: "$metrics",
            as: "metric",
            in: {
              metricName: "$$metric.metricName",
              count: "$$metric.count",
              weightedAverage: "$$metric.weightedAverage",
              categories: "$$metric.categories"
            }
          }
        }
      }
    }
  ]);
};

// example userRatingAggregator return value:
// {
//   createdBy: "Pine",
//   email: "user@berkeley.edu",
//   count: 2,
//   classes: [
//     {
//       subject: "COMPSCI",
//       courseNumber: "1001",
//       semester: "FALL",
//       year: 2023,
//       class: "61B",
//       metrics: [
//         { metricName: "Difficulty", value: 4, updatedAt: "2024-03-20T15:30:45.123Z" },
//         { metricName: "Workload", value: 3, updatedAt: "2024-03-20T15:30:45.123Z" },
//         { metricName: "Usefulness", value: 5, updatedAt: "2024-03-20T15:30:45.123Z" },
//         { metricName: "Attendance", value: 0, updatedAt: "2024-03-20T15:30:45.123Z" },
//         { metricName: "Recording", value: 1, updatedAt: "2024-03-20T15:30:45.123Z" }
//       ]
//     },
//     {
//       subject: "DATA",
//       courseNumber: "1002",
//       semester: "SPRING",
//       year: 2024,
//       class: "140",
//       metrics: [
//         { metricName: "Difficulty", value: 5, updatedAt: "2024-03-20T15:30:45.123Z" },
//         { metricName: "Recording", value: 0, updatedAt: "2024-03-20T15:30:45.123Z" }
//       ]
//     }
//   ],
// }

// example ratingAggregator return value:
// {
//   subject: "COMPSCI",
//   courseNumber: "1003",
//   semester: "FALL",
//   year: 2023,
//   class: "70",
//   metrics: [
//     {
//       metricName: "Difficulty",
//       count: 45,
//       weightedAverage: 3.44,
//       categories: [
//         { value: 5, count: 10 },
//         { value: 4, count: 15 },
//         { value: 3, count: 10 },
//         { value: 2, count: 5 },
//         { value: 1, count: 5 }
//       ]
//     },
//     {
//       metricName: "Workload",
//       count: 92,
//       weightedAverage: 2.8,
//       categories: [
//         { value: 5, count: 15 },
//         { value: 4, count: 12 },
//         { value: 3, count: 10 },
//         { value: 2, count: 50 },
//         { value: 1, count: 5 }
//       ]
//     },
//   ]
// }
