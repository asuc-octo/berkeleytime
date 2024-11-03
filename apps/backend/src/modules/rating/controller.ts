import { RatingModel, AggregatedRatingModel } from "@repo/common";

import { MetricName, Semester } from "../../generated-types/graphql";
import {
  formatAggregatedRatings,
  formatSemesters,
  formatUserRatings,
} from "./formatter";

// TODO: test for cases intentionally trying to break mutation (out of bound values)
// TODO: test for cases for fetching empty data

export const createRating = async (
  context: any,
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string,
  metricName: MetricName,
  value: number
) => {
  if (!context.user._id) throw new Error("Unauthorized");
  checkValueConstraint(metricName, value);

  const existingRating = await checkRatingExists(
    context,
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
    metricName
  );

  // update existing rating
  // look for old metric category in aggregatedRatingModel, - 1 count. if new count is 0, delete from aggregatedRatingModel
  // look for new metric category in aggregatedRatingModel, + 1 count
  // abstract out -1 and delete rating logic?
  if (existingRating) {
    existingRating.value = value;
    await existingRating.save();
  } else {
    // create new rating
    // look for metric category in aggregatedRatingModel, + 1 count. initialize if not exists
    await RatingModel.create({
      createdBy: context.user._id,
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
      metricName,
      value,
    });
  }

  // new aggregator will use aggregatedRatingModel, using static category counts. Calculate weightedAverage
  const aggregated = await ratingAggregator({
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
  });

  if (!aggregated.length) {
    return {
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
      metrics: [],
    };
  }

  return formatAggregatedRatings(aggregated[0]);
};

// if delete = true, find metric category in aggregatedRatingModel, - 1 count. if new count is 0, delete from aggregatedRatingModel
export const deleteRating = async (
  context: any,
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string,
  metricName: MetricName
) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const deletedRating = await RatingModel.findOneAndDelete({
    createdBy: context.user._id,
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
    metricName,
  });

  if (!deletedRating) {
    throw new Error("Rating not found");
  }

  return true;
};

export const getUserRatings = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const userRatings = await userRatingAggregator(context);
  if (!userRatings.length)
    return {
      createdBy: context.user._id,
      count: 0,
      classes: [],
    };
  return formatUserRatings(userRatings[0]);
};

export const getAggregatedRatings = async (
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string,
  isAllTime: boolean
) => {
  let filter;
  if (isAllTime) {
    filter = {
      subject,
      courseNumber,
      classNumber,
    };
  } else {
    filter = {
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
    };
  }
  const aggregated = await ratingAggregator(filter);
  if (!aggregated.length)
    return {
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
      metrics: [],
    };

  return formatAggregatedRatings(aggregated[0]);
};

// use aggregatedRatingModel for more efficient query
export const getSemestersWithRatings = async (
  subject: string,
  courseNumber: string
) => {
  const semesters = await semesterAggregator(subject, courseNumber);
  return formatSemesters(semesters);
};

// Helper functions

const checkRatingExists = async (
  context: any,
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string,
  metricName: MetricName
) => {
  return await RatingModel.findOne({
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
    metricName,
    createdBy: context.user._id,
  });
};

const checkValueConstraint = (metricName: MetricName, value: number) => {
  const numberScaleMetrics = ["Usefulness", "Difficulty", "Workload"] as const;
  const booleanScaleMetrics = ["Attendance", "Recording"] as const;

  if (
    numberScaleMetrics.includes(
      metricName as (typeof numberScaleMetrics)[number]
    )
  ) {
    if (value < 1 || value > 5 || !Number.isInteger(value)) {
      throw new Error(
        `${metricName} rating must be an integer between 1 and 5`
      );
    }
  } else if (
    booleanScaleMetrics.includes(
      metricName as (typeof booleanScaleMetrics)[number]
    )
  ) {
    if (value !== 0 && value !== 1) {
      throw new Error(`${metricName} rating must be either 0 or 1`);
    }
  }
};

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
          classNumber: "$classNumber",
        },
        metrics: {
          $push: {
            metricName: "$metricName",
            value: "$value",
            // updatedAt: "$updatedAt" - not sure how to do the typedef
          },
        },
      },
    },
    {
      $group: {
        _id: {
          createdBy: "$_id.createdBy",
        },
        classes: {
          $push: {
            subject: "$_id.subject",
            courseNumber: "$_id.courseNumber",
            semester: "$_id.semester",
            year: "$_id.year",
            classNumber: "$_id.classNumber",
            metrics: "$metrics",
          },
        },
        totalCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        createdBy: "$_id.createdBy",
        count: "$totalCount",
        classes: 1,
      },
    },
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
          classNumber: "$classNumber",
          metricName: "$metricName",
        },
        totalCount: { $sum: 1 },
        sumValues: { $sum: "$value" },
        categories: { $push: { value: "$value", count: 1 } },
      },
    },
    {
      $group: {
        _id: {
          subject: "$_id.subject",
          courseNumber: "$_id.courseNumber",
          classNumber: "$_id.classNumber",
        },
        metrics: {
          $push: {
            metricName: "$_id.metricName",
            count: "$totalCount",
            weightedAverage: { $divide: ["$sumValues", "$totalCount"] },
            categories: "$categories",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        subject: "$_id.subject",
        courseNumber: "$_id.courseNumber",
        classNumber: "$_id.classNumber",
        metrics: 1,
      },
    },
  ]);
};

const semesterAggregator = async (subject: string, courseNumber: string) => {
  return await RatingModel.aggregate([
    { $match: { subject: subject, courseNumber: courseNumber } },
    { $group: { _id: { semester: "$semester", year: "$year" } } },
    { $project: { _id: 0, semester: "$_id.semester", year: "$_id.year" } },
  ]);
};
