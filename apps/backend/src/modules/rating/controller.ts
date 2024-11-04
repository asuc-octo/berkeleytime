import { AggregatedMetricsModel, RatingModel } from "@repo/common";

import { MetricName, Semester } from "../../generated-types/graphql";
import {
  formatAggregatedRatings,
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

  if (existingRating) {
    const oldValue = existingRating.value;
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
      false,
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
      true,
    );
    
  } else {
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
    handleCategoryChange(
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
      metricName,
      value,
      true,
    )
  }
  return getAggregatedRatings(
    subject,
    courseNumber,
    semester,
    year,
    classNumber
  )
}

const handleCategoryChange = async (
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string,
  metricName: MetricName,
  categoryValue: Number,
  isIncrement: Boolean, // false means is decrement
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
    const newMetric = await AggregatedMetricsModel.create({
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
      metricName,
      categoryValue,
      categoryCount: 1,
  })
    await newMetric.save();
  } else {
    throw new Error("Aggregated Rating does not exist, cannot decrement");
  }
  
}


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
  classNumber: string
) => {
  const aggregated = await AggregatedMetricsModel.aggregate([
   { $match: 
    {
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
    } 
   },
   {
    $group: {
      _id: {
        subject: "$subject",
        courseNumber: "$courseNumber",
        classNumber: "$classNumber",
        semester: "$",
        metricName: "$metricName",
      }, 
      totalCount: { $sum: 1 },
      sumValues: { $sum: { $multiply: [ "$categoryValue", "$categoryCount"]}},
      categories: {
        $push: { value: "$categoryValue", count: "$categoryCount"}
      }
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
  }
  ])
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
