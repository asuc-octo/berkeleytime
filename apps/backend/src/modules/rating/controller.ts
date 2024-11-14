import {
  AggregatedMetricsModel,
  RatingModel,
  UserModel,
} from "@repo/common";
import {
  MetricName,
  Semester,
} from "../../generated-types/graphql";
import {
  ratingAggregator,
  userClassRatingsAggregator,
  userRatingsAggregator,
} from "./helper/aggregator";
import { 
  checkRatingExists,
  checkUserClassRatingsCount,
  checkValueConstraint,
} from "./helper/checkConstraints";
import {
  formatAggregatedRatings,
  formatUserClassRatings,
  formatUserRatings,
} from "./formatter";
import { connection } from 'mongoose';

export const numberScaleMetrics = [
  "Usefulness",
  "Difficulty",
  "Workload",
] as MetricName[];

export const booleanScaleMetrics = [
  "Attendance",
  "Recording",
  "Recommended",
] as MetricName[];

// TODO: for functions that mutate multiple schemas, mutation should revert if all does not succeed to avoid out-of-sync issues.
// Mongo transaction is built for this application.

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

  const session = await connection.startSession();
  try {
    await session.withTransaction(async () => {
      const existingRating = await checkRatingExists(
        context,
        subject,
        courseNumber,
        metricName
      );

      let skipEdit = false;
      // Case 1: User has an existing rating for this course, but for a different semester/year/classNumber.
      // We delete the old rating -> send to Case 3.
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
          existingRating.metricName as MetricName,
          session
        );
        skipEdit = true;
      }
      // Case 2: User is updating an existing rating for the same class section
      // We update the existing rating.
      if (existingRating && !skipEdit) {
        const oldValue = existingRating.value;
        if (oldValue != value) {
          existingRating.value = value;
          await existingRating.save({ session });

          // decrement count of old category
          await handleCategoryCountChange(
            subject,
            courseNumber,
            semester,
            year,
            classNumber,
            metricName,
            oldValue,
            false,
            session
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
            true,
            session
          );
        }
      // Case 3: Either:
      //   - User has no existing rating (existingRating is null)
      //   - OR user had a rating for different section that was just deleted (skipEdit is true)
      } else {
        if (!checkUserClassRatingsCount(context)) {
          throw new Error("User has reached the rating threshold");
        }
        await RatingModel.create([{
          createdBy: context.user._id,
          subject,
          courseNumber,
          semester,
          year,
          classNumber,
          metricName,
          value,
        }], { session });

        await handleCategoryCountChange(
          subject,
          courseNumber,
          semester,
          year,
          classNumber,
          metricName,
          value,
          true,
          session
        );

        const user = await UserModel.findOne({ googleId: context.user.googleId });
        if (user) {
          user.classRatingsCount = (user.classRatingsCount || 0) + 1;
          await user.save({ session });
        }
      }
    });
  } finally {
    await session.endSession();
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
  metricName: MetricName,
  existingSession?: any
) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const session = existingSession || await connection.startSession();
  try {
    await session.withTransaction(async () => {
      const deletedRating = await RatingModel.findOneAndDelete(
        {
          createdBy: context.user._id,
          subject,
          courseNumber,
          semester,
          year,
          classNumber,
          metricName,
        },
        { session }
      );

      if (!deletedRating) {
        throw new Error("Rating not found");
      }

      await handleCategoryCountChange(
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        metricName,
        deletedRating.value,
        false,
        session
      );

      const user = await UserModel.findOne({ googleId: context.user.googleId });
      if (user) {
        const newCount = Math.max(0, (user.classRatingsCount || 0) - 1);
        user.classRatingsCount = newCount;
        await user.save({ session });
      }
    });
  } finally {
    if (!existingSession) {
      await session.endSession();
    }
  }

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

const handleCategoryCountChange = async (
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string,
  metricName: MetricName,
  categoryValue: Number,
  isIncrement: Boolean, // false means is decrement
  session?: any
) => {
  const delta = isIncrement ? 1 : -1;
  const metric = await AggregatedMetricsModel.findOne({
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
    metricName,
    categoryValue,
  }).session(session);
  if (metric) {
    metric.categoryCount += delta;
    await metric.save({ session });
  } else if (isIncrement) {
    let range: number[] = [];
    switch (true) {
      case numberScaleMetrics.includes(metricName):
        range = [1, 2, 3, 4, 5];
        break;
      case booleanScaleMetrics.includes(metricName):
        range = [0, 1];
        break;
      default:
        throw new Error("Invalid metric name");
    }
    for (const v of range) {
      await AggregatedMetricsModel.create([{
        subject,
        courseNumber,
        semester,
        year,
        classNumber,
        metricName,
        categoryValue: v,
        categoryCount: v == categoryValue ? 1 : 0,
      }], { session });
    }
  } else {
    throw new Error("Aggregated Rating does not exist, cannot decrement");
  }
};
