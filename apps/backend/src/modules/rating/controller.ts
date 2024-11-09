import { AggregatedMetricsModel, RatingModel } from "@repo/common";

import { MetricName, Semester } from "../../generated-types/graphql";
import {
  ratingAggregator,
  userClassRatingsAggregator,
  userRatingsAggregator,
} from "./aggregator";
import {
  formatAggregatedRatings,
  formatUserClassRatings,
  formatUserRatings,
} from "./formatter";

const numberScaleMetrics = [
  "Usefulness",
  "Difficulty",
  "Workload",
] as MetricName[];

const booleanScaleMetrics = [
  "Attendance",
  "Recording",
] as MetricName[];

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
  if (
    existingRating &&
    (existingRating.semester != semester ||
      existingRating.year != year ||
      existingRating.classNumber != classNumber)
  ) {
    await deleteRating(
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
      await handleCategoryCountChange(
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
      await handleCategoryCountChange(
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
    await handleCategoryCountChange(
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
  return await getClassAggregatedRatings(
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

  handleCategoryCountChange(
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
  // possibly store this in user model?
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

export const getClassAggregatedRatings = async (
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string
) => {
  const aggregated = await ratingAggregator({
    subject,
    courseNumber,
    classNumber,
    semester,
    year,
  });
  if (!aggregated || !aggregated[0])
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

export const getCourseAggregatedRatings = async (
  subject: string,
  courseNumber: string
) => {
  const aggregated = await ratingAggregator({
    subject,
    courseNumber,
  });
  if (!aggregated || !aggregated[0])
    return {
      subject,
      courseNumber,
      semester: null,
      year: null,
      classNumber: null,
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

const checkValueConstraint = (
  metricName: MetricName,
  value: number
) => {
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

const handleCategoryCountChange = async (
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
