import { AggregatedMetricsModel, RatingModel } from "@repo/common";

import { MetricName, Semester } from "../../generated-types/graphql";
import {
  formatAggregatedRatings,
  formatUserClassRatings,
  formatUserRatings,
} from "./formatter";

export const numberScaleMetrics = [
  "Usefulness",
  "Difficulty",
  "Workload",
] as MetricName[];
export const booleanScaleMetrics = ["Attendance", "Recording"] as MetricName[];

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
    metricName
  );

  let skipEdit = false;
  console.log(existingRating);
  if (
    existingRating &&
    (existingRating.semester != semester ||
      existingRating.year != year ||
      existingRating.classNumber != classNumber)
  ) {
    deleteRating(
      context,
      existingRating.subject,
      existingRating.courseNumber,
      existingRating.semester as Semester,
      existingRating.year,
      existingRating.classNumber,
      existingRating.metricName as MetricName
    );
    skipEdit = true;
  }
  if (existingRating && !skipEdit) {
    const oldValue = existingRating.value;
    if (oldValue != value) {
      existingRating.value = value;
      existingRating.save();

      // decrement count of old category
      handleCategoryChange(
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        metricName,
        oldValue,
        false
      );
      // incremdent count of new category
      handleCategoryChange(
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        metricName,
        value,
        true
      );
    }
  } else {
    await RatingModel.create({
      createdBy: context.user._id,
      subject: subject,
      courseNumber: courseNumber,
      semester: semester,
      year: year,
      classNumber: classNumber,
      metricName: metricName,
      value: value,
    });
    handleCategoryChange(
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
      metricName,
      value,
      true
    );
  }
  return getAggregatedRatings(
    subject,
    courseNumber,
    semester,
    year,
    classNumber
  );
};

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

  handleCategoryChange(
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
    metricName,
    deletedRating.value,
    false
  );

  return true;
};

export const getUserClassRatings = async (
  context: any,
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string
) => {
  if (!context.user._id) throw new Error("Unauthorized");
  const userRatings = await userClassRatingsAggregator(
    context,
    subject,
    courseNumber,
    semester,
    year,
    classNumber
  );
  if (!userRatings.length)
    return {
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
      metrics: [],
    };
  return formatUserClassRatings(userRatings[0]);
};

export const getUserRatings = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const userRatings = await userRatingsAggregator(context);
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
  classNumber: string
) => {
  const aggregated = await AggregatedMetricsModel.aggregate([
    {
      $match: {
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
      },
    },
    {
      $group: {
        _id: {
          subject: "$subject",
          courseNumber: "$courseNumber",
          classNumber: "$classNumber",
          semester: "$semester",
          metricName: "$metricName",
        },
        totalCount: { $sum: "$categoryCount" },
        sumValues: {
          $sum: { $multiply: ["$categoryValue", "$categoryCount"] },
        },
        categories: {
          $push: { value: "$categoryValue", count: "$categoryCount" },
        },
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
            weightedAverage: {
              $cond: [
                { $eq: ["$totalCount", 0] },
                0,
                { $divide: ["$sumValues", "$totalCount"] },
              ],
            },
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

// Helper functions

const checkRatingExists = async (
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

const checkValueConstraint = (metricName: MetricName, value: number) => {
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

const handleCategoryChange = async (
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string,
  metricName: MetricName,
  categoryValue: Number,
  isIncrement: Boolean // false means is decrement
) => {
  const delta = isIncrement ? 1 : -1;
  const metric = await AggregatedMetricsModel.findOne({
    subject: subject,
    courseNumber: courseNumber,
    semester: semester,
    year: year,
    classNumber: classNumber,
    metricName: metricName,
    categoryValue: categoryValue,
  });
  if (metric) {
    metric.categoryCount += delta;
    await metric.save();
  } else if (isIncrement) {
    let range = [];
    if (numberScaleMetrics.includes(metricName)) {
      range = [1, 2, 3, 4, 5];
    } else {
      range = [0, 1];
    }
    for (const v of range) {
      (
        await AggregatedMetricsModel.create({
          subject: subject,
          courseNumber: courseNumber,
          semester: semester,
          year: year,
          classNumber: classNumber,
          metricName: metricName,
          categoryValue: v,
          categoryCount: v == categoryValue ? 1 : 0,
        })
      ).save();
    }
  } else {
    throw new Error("Aggregated Rating does not exist, cannot decrement");
  }
};

const userRatingsAggregator = async (context: any) => {
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

const userClassRatingsAggregator = async (
  context: any,
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string
) => {
  if (!context.user._id) throw new Error("Unauthorized");
  return await RatingModel.aggregate([
    {
      $match: {
        createdBy: context.user._id,
        subject: subject,
        courseNumber: courseNumber,
        semester: semester,
        year: year,
        classNumber: classNumber,
      },
    },
    {
      $group: {
        _id: {
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
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        subject: "$_id.subject",
        courseNumber: "$_id.courseNumber",
        semester: "$_id.semester",
        year: "$_id.year",
        classNumber: "$_id.classNumber",
        metrics: 1,
      },
    },
  ]);
};
