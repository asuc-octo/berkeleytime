import { GraphQLError } from "graphql";
import { connection } from "mongoose";

import { AggregatedMetricsModel, RatingModel, RatingType } from "@repo/common";
import { METRIC_MAPPINGS } from "@repo/shared";

import { MetricName, Semester } from "../../generated-types/graphql";
import {
  formatAggregatedRatings,
  formatSemesterRatings,
  formatUserClassRatings,
  formatUserRatings,
} from "./formatter";
import {
  courseRatingAggregator,
  ratingAggregator,
  semestersWithRatingsAggregator,
  userClassRatingsAggregator,
  userRatingsAggregator,
} from "./helper/aggregator";
import {
  checkRatingExists,
  checkUserMaxRatingsConstraint,
  checkValueConstraint,
} from "./helper/checkConstraints";

export interface RequestContext {
  user: {
    _id: string;
  };
}

interface RatingData {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  metricName: MetricName;
  value: number;
}

export const numberScaleMetrics = Object.entries(METRIC_MAPPINGS)
  .filter(([_, config]) => config.isRating)
  .map(([metric]) => metric) as MetricName[];

export const booleanScaleMetrics = Object.entries(METRIC_MAPPINGS)
  .filter(([_, config]) => !config.isRating)
  .map(([metric]) => metric) as MetricName[];

// const getSemestersByInstructor = async (
//   professorName: string,
//   subject: string,
//   courseNumber: string
// ): Promise<string[]> => {
//   const semesterInstances = await semestersByInstructorAggregator(
//     professorName,
//     subject,
//     courseNumber
//   );
//   const result = semesterInstances.map((i: any) => i._id);
//   return result;
// };

// not fully implemented
// export const getRatingByInstructor = async (
//   professorName: string,
//   subject: string,
//   courseNumber: string
// ) => {
//   const semesters = await getSemestersByInstructor(
//     professorName,
//     subject,
//     courseNumber
//   );
//   return semesters;
// };

export const createRating = async (
  context: RequestContext,
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string,
  metricName: MetricName,
  value: number
) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  checkValueConstraint(metricName, value);

  // Get current user ratings before making any changes
  const userRatings = await getUserRatings(context);
  checkUserMaxRatingsConstraint(
    userRatings,
    year,
    semester as Semester,
    subject,
    courseNumber
  );

  // check for user ratings count total + for this semester instance.

  const session = await connection.startSession();
  try {
    await session.withTransaction(async () => {
      const existingRating = await checkRatingExists(
        context,
        subject,
        courseNumber,
        metricName
      );
      if (!existingRating) {
        await createNewRating(
          context,
          {
            year,
            semester,
            subject,
            courseNumber,
            classNumber,
            metricName,
            value,
          },
          session
        );
        return;
      }

      if (
        existingRating.semester !== semester ||
        existingRating.year !== year ||
        existingRating.classNumber !== classNumber
      ) {
        await deleteRating(
          context,
          Number(existingRating.year),
          existingRating.semester as Semester,
          existingRating.subject,
          existingRating.courseNumber,
          existingRating.classNumber,
          existingRating.metricName as MetricName,
          session
        );
        await createNewRating(
          context,
          {
            year,
            semester,
            subject,
            courseNumber,
            classNumber,
            metricName,
            value,
          },
          session
        );
      } else {
        await handleExistingRating(existingRating, value, session);
      }
    });
  } finally {
    await session.endSession();
  }

  return true;
};

const deleteRatingOperations = async (
  context: RequestContext,
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string,
  metricName: MetricName,
  session: any
) => {
  const rating = await RatingModel.findOne({
    createdBy: context.user._id,
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
    metricName,
  });

  if (!rating) {
    throw new GraphQLError("Rating not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  await Promise.all([
    RatingModel.deleteOne(
      {
        _id: rating._id,
      },
      { session }
    ),
    handleCategoryCountChange(
      year,
      semester,
      subject,
      courseNumber,
      classNumber,
      metricName,
      rating.value,
      false,
      session
    ),
  ]);

  return rating;
};

export const deleteRating = async (
  context: RequestContext,
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string,
  metricName: MetricName,
  existingSession?: any // for nested transactions only
) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (existingSession) {
    // Just run the operations without starting a new transaction
    await deleteRatingOperations(
      context,
      year,
      semester,
      subject,
      courseNumber,
      classNumber,
      metricName,
      existingSession
    );
  } else {
    // Start a new transaction only if we don't have an existing session
    const session = await connection.startSession();
    try {
      await session.withTransaction(async () => {
        await deleteRatingOperations(
          context,
          year,
          semester,
          subject,
          courseNumber,
          classNumber,
          metricName,
          session
        );
      });
    } finally {
      await session.endSession();
    }
  }

  return true;
};

export const getUserClassRatings = async (
  context: RequestContext,
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string
) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
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

export const getUserRatings = async (context: RequestContext) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

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
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
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
  const aggregated = await courseRatingAggregator(subject, courseNumber);

  if (!aggregated || !aggregated[0]) {
    return {
      subject,
      courseNumber,
      semester: null,
      year: null,
      classNumber: null,
      metrics: [],
    };
  }

  const formattedResult = formatAggregatedRatings(aggregated[0]);
  return formattedResult;
};

export const getSemestersWithRatings = async (
  subject: string,
  courseNumber: string
) => {
  const semesters = await semestersWithRatingsAggregator(subject, courseNumber);
  return formatSemesterRatings(semesters);
};

// Helper functions

const createNewRating = async (
  context: RequestContext,
  ratingData: RatingData,
  session: any
) => {
  const {
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
    metricName,
    value,
  } = ratingData;

  await Promise.all([
    RatingModel.create(
      [
        {
          createdBy: context.user._id,
          ...ratingData,
        },
      ],
      { session }
    ),
    handleCategoryCountChange(
      year,
      semester,
      subject,
      courseNumber,
      classNumber,
      metricName,
      value,
      true,
      session
    ),
  ]);
};

const handleExistingRating = async (
  existingRating: RatingType,
  newValue: number,
  session: any
) => {
  const oldValue = existingRating.value;
  if (oldValue === newValue) return;

  await RatingModel.updateOne(
    { _id: existingRating._id },
    { value: newValue },
    { session }
  );

  await Promise.all([
    handleCategoryCountChange(
      Number(existingRating.year),
      existingRating.semester as Semester,
      existingRating.subject,
      existingRating.courseNumber,
      existingRating.classNumber,
      existingRating.metricName as MetricName,
      oldValue,
      false,
      session
    ),
    handleCategoryCountChange(
      Number(existingRating.year),
      existingRating.semester as Semester,
      existingRating.subject,
      existingRating.courseNumber,
      existingRating.classNumber,
      existingRating.metricName as MetricName,
      newValue,
      true,
      session
    ),
  ]);
};

const handleCategoryCountChange = async (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
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
    let valueRange: number[] = [];
    switch (true) {
      case numberScaleMetrics.includes(metricName):
        valueRange = [1, 2, 3, 4, 5];
        break;
      case booleanScaleMetrics.includes(metricName):
        valueRange = [0, 1];
        break;
      default:
        throw new GraphQLError("Invalid metric name", {
          extensions: { code: "INVALID_ARGUMENT" },
        });
    }
    for (const v of valueRange) {
      await AggregatedMetricsModel.create(
        [
          {
            subject,
            courseNumber,
            semester,
            year,
            classNumber,
            metricName,
            categoryValue: v,
            categoryCount: v == categoryValue ? 1 : 0,
          },
        ],
        { session }
      );
    }
  } else {
    throw new GraphQLError(
      "Aggregated Rating does not exist, cannot decrement",
      {
        extensions: { code: "NOT_FOUND" },
      }
    );
  }
};
