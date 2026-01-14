import { createHash } from "crypto";
import { GraphQLError } from "graphql";
import { type ClientSession, connection } from "mongoose";

import {
  AggregatedMetricsModel,
  ClassModel,
  CourseModel,
  RatingModel,
  RatingType,
  SectionModel,
} from "@repo/common";
import { METRIC_MAPPINGS, REQUIRED_METRICS } from "@repo/shared";

import {
  InputMaybe,
  MetricName,
  Semester,
} from "../../generated-types/graphql";
import {
  formatAggregatedRatings,
  formatSemesterRatings,
  formatUserClassRatings,
  formatUserRatings,
} from "./formatter";
import {
  courseRatingAggregator,
  instructorRatingsAggregator,
  ratingAggregator,
  semestersWithRatingsAggregator,
  termRatingsAggregator,
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
  classId: unknown; // ObjectId
  courseId: string;
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  metricName: MetricName;
  value: number;
}

const getClassDocument = async (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string
) => {
  const classDoc = await ClassModel.findOne({
    year,
    semester,
    subject,
    courseNumber,
    number: classNumber,
  });

  if (!classDoc) {
    throw new GraphQLError(
      `Class not found: ${subject} ${courseNumber} ${semester} ${year} #${classNumber}`,
      {
        extensions: { code: "NOT_FOUND" },
      }
    );
  }

  return classDoc;
};

const getCourseId = async (
  subject: string,
  courseNumber: string
): Promise<string | null> => {
  const course = await CourseModel.findOne({
    subject,
    number: courseNumber,
  }).select("courseId");

  return course?.courseId ?? null;
};

export const numberScaleMetrics = Object.entries(METRIC_MAPPINGS)
  .filter(([, config]) => config.isRating)
  .map(([metric]) => metric) as MetricName[];

export const booleanScaleMetrics = Object.entries(METRIC_MAPPINGS)
  .filter(([, config]) => !config.isRating)
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

  // Get class document to obtain classId and courseId
  const classDoc = await getClassDocument(
    year,
    semester,
    subject,
    courseNumber,
    classNumber
  );
  const classId = classDoc._id;
  const courseId = classDoc.courseId;

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
            classId,
            courseId,
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
            classId,
            courseId,
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
  session: ClientSession
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
      rating.classId,
      rating.courseId,
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
  existingSession?: ClientSession // for nested transactions only
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

const filterAggregatedMetrics = (
  aggregated: ReturnType<typeof formatAggregatedRatings>,
  metricNames?: InputMaybe<MetricName[]>
) => {
  if (!metricNames || metricNames.length === 0) {
    return aggregated;
  }

  const allowedMetrics = new Set(metricNames);
  return {
    ...aggregated,
    metrics: aggregated.metrics.filter((metric) =>
      allowedMetrics.has(metric.metricName as MetricName)
    ),
  };
};

export const getClassAggregatedRatings = async (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber?: InputMaybe<string>,
  metricNames?: InputMaybe<MetricName[]>
) => {
  const aggregated = classNumber
    ? await ratingAggregator({
        subject,
        courseNumber,
        classNumber,
        semester,
        year,
      })
    : await termRatingsAggregator(subject, courseNumber, semester, year);
  if (!aggregated || !aggregated[0])
    return {
      subject,
      courseNumber,
      semester,
      year,
      classNumber,
      metrics: [],
    };

  return filterAggregatedMetrics(
    formatAggregatedRatings(aggregated[0]),
    metricNames
  );
};

export const getCourseAggregatedRatings = async (
  subject: string,
  courseNumber: string,
  metricNames?: InputMaybe<MetricName[]>
) => {
  const courseId = await getCourseId(subject, courseNumber);
  if (!courseId) {
    return {
      subject,
      courseNumber,
      semester: null,
      year: null,
      classNumber: null,
      metrics: [],
    };
  }

  const aggregated = await courseRatingAggregator(courseId);

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
  return filterAggregatedMetrics(formattedResult, metricNames);
};

export const getSemestersWithRatings = async (
  subject: string,
  courseNumber: string
) => {
  const courseId = await getCourseId(subject, courseNumber);
  if (!courseId) {
    return [];
  }

  const semesters = await semestersWithRatingsAggregator(courseId);
  return formatSemesterRatings(semesters);
};

export const getCourseRatingsCount = async (
  subject: string,
  courseNumber: string
): Promise<number> => {
  const courseId = await getCourseId(subject, courseNumber);

  if (!courseId) {
    return 0;
  }

  const aggregated = await courseRatingAggregator(courseId);

  if (!aggregated || !aggregated[0]) {
    return 0;
  }

  const formatted = formatAggregatedRatings(aggregated[0]);
  // Return the max count across all metrics (they should be roughly equal)
  const maxCount = Math.max(
    0,
    ...formatted.metrics.map((metric) => metric.count)
  );
  return maxCount;
};

export const getInstructorAggregatedRatings = async (
  subject: string,
  courseNumber: string
) => {
  const courseId = await getCourseId(subject, courseNumber);
  if (!courseId) {
    return [];
  }

  const sections = await SectionModel.find({ courseId }).select(
    "semester year number classNumber meetings"
  );

  const instructorMap = new Map<
    string,
    {
      givenName: string;
      familyName: string;
      classes: { semester: Semester; year: number; classNumber: string }[];
    }
  >();

  sections.forEach((section) => {
    section.meetings?.forEach((meeting) => {
      meeting.instructors?.forEach((instructor) => {
        // Only include Primary Instructors (PI role)
        if (
          instructor.givenName &&
          instructor.familyName &&
          instructor.role === "PI"
        ) {
          const key = `${instructor.givenName}_${instructor.familyName}`;

          if (!instructorMap.has(key)) {
            instructorMap.set(key, {
              givenName: instructor.givenName,
              familyName: instructor.familyName,
              classes: [],
            });
          }

          const instructorData = instructorMap.get(key)!;
          const classInfo = {
            semester: section.semester as Semester,
            year: section.year,
            classNumber: section.classNumber ?? section.number,
          };

          // Avoid duplicates
          const exists = instructorData.classes.some(
            (c) =>
              c.semester === classInfo.semester &&
              c.year === classInfo.year &&
              c.classNumber === classInfo.classNumber
          );

          if (!exists) {
            instructorData.classes.push(classInfo);
          }
        }
      });
    });
  });

  // For each instructor, aggregate their ratings
  const instructorRatings = await Promise.all(
    Array.from(instructorMap.values()).map(async (instructorData) => {
      const aggregated = await instructorRatingsAggregator(
        courseId,
        instructorData.classes
      );

      return {
        instructor: {
          givenName: instructorData.givenName,
          familyName: instructorData.familyName,
        },
        aggregatedRatings: formatAggregatedRatings(aggregated),
        classesTaught: instructorData.classes,
      };
    })
  );

  // Only return instructors who have ratings
  const instructorsWithRatings = instructorRatings.filter((rating) => {
    const hasRatings = rating.aggregatedRatings.metrics.some(
      (metric) => metric && metric.count > 0
    );
    return hasRatings;
  });

  return instructorsWithRatings;
};

// Helper functions

const createNewRating = async (
  context: RequestContext,
  ratingData: RatingData,
  session: ClientSession
) => {
  const {
    classId,
    courseId,
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
      classId,
      courseId,
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
  session: ClientSession
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
      existingRating.classId,
      existingRating.courseId,
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
      existingRating.classId,
      existingRating.courseId,
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
  classId: unknown, // ObjectId
  courseId: string,
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string,
  metricName: MetricName,
  categoryValue: number,
  isIncrement: boolean, // false means is decrement
  session?: ClientSession
) => {
  const delta = isIncrement ? 1 : -1;
  const metric = await AggregatedMetricsModel.findOne({
    classId,
    metricName,
    categoryValue,
  }).session(session ?? null);
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
            classId,
            courseId,
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

interface MetricInput {
  metricName: MetricName;
  value: number;
}

export const createRatings = async (
  context: RequestContext,
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  classNumber: string,
  metrics: MetricInput[]
) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Validate required metrics are present
  const providedMetrics = new Set(metrics.map((m) => m.metricName));
  const missingRequired = REQUIRED_METRICS.filter(
    (m) => !providedMetrics.has(m as MetricName)
  );
  if (missingRequired.length > 0) {
    throw new GraphQLError(
      `Missing required metrics: ${missingRequired.join(", ")}`,
      {
        extensions: { code: "BAD_USER_INPUT" },
      }
    );
  }

  // Validate all metric values
  for (const metric of metrics) {
    checkValueConstraint(metric.metricName, metric.value);
  }

  // Get class document to obtain classId and courseId
  const classDoc = await getClassDocument(
    year,
    semester,
    subject,
    courseNumber,
    classNumber
  );
  const classId = classDoc._id;
  const courseId = classDoc.courseId;

  // Get current user ratings for constraint checking
  const userRatings = await getUserRatings(context);
  checkUserMaxRatingsConstraint(
    userRatings,
    year,
    semester as Semester,
    subject,
    courseNumber
  );

  // Find all existing ratings for this course by this user (using courseId for cross-listing support)
  const existingRatings = await RatingModel.find({
    createdBy: context.user._id,
    courseId,
  });

  const session = await connection.startSession();
  try {
    await session.withTransaction(async () => {
      // Step 1: Delete all existing ratings and decrement their aggregated counts
      for (const existingRating of existingRatings) {
        await Promise.all([
          RatingModel.deleteOne({ _id: existingRating._id }, { session }),
          handleCategoryCountChange(
            existingRating.classId,
            existingRating.courseId,
            Number(existingRating.year),
            existingRating.semester as Semester,
            existingRating.subject,
            existingRating.courseNumber,
            existingRating.classNumber,
            existingRating.metricName as MetricName,
            existingRating.value,
            false,
            session
          ),
        ]);
      }

      // Step 2: Create all new ratings and increment their aggregated counts
      for (const metric of metrics) {
        await Promise.all([
          RatingModel.create(
            [
              {
                createdBy: context.user._id,
                classId,
                courseId,
                subject,
                courseNumber,
                semester,
                year,
                classNumber,
                metricName: metric.metricName,
                value: metric.value,
              },
            ],
            { session }
          ),
          handleCategoryCountChange(
            classId,
            courseId,
            year,
            semester,
            subject,
            courseNumber,
            classNumber,
            metric.metricName,
            metric.value,
            true,
            session
          ),
        ]);
      }
    });
  } finally {
    await session.endSession();
  }

  return true;
};

export const deleteRatings = async (
  context: RequestContext,
  subject: string,
  courseNumber: string
) => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Find all existing ratings for this course by this user
  const existingRatings = await RatingModel.find({
    createdBy: context.user._id,
    subject,
    courseNumber,
  });

  if (existingRatings.length === 0) {
    return true; // Nothing to delete
  }

  const session = await connection.startSession();
  try {
    await session.withTransaction(async () => {
      // Delete all ratings and decrement their aggregated counts
      for (const existingRating of existingRatings) {
        await Promise.all([
          RatingModel.deleteOne({ _id: existingRating._id }, { session }),
          handleCategoryCountChange(
            existingRating.classId,
            existingRating.courseId,
            Number(existingRating.year),
            existingRating.semester as Semester,
            existingRating.subject,
            existingRating.courseNumber,
            existingRating.classNumber,
            existingRating.metricName as MetricName,
            existingRating.value,
            false,
            session
          ),
        ]);
      }
    });
  } finally {
    await session.endSession();
  }

  return true;
};

const anonymizeUserId = (userId: string): string => {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
};

export const getAllRatings = async () => {
  const ratings = await RatingModel.find({}).lean();

  return ratings.map((rating) => ({
    anonymousUserId: anonymizeUserId(rating.createdBy),
    subject: rating.subject,
    courseNumber: rating.courseNumber,
    semester: rating.semester as Semester,
    year: rating.year,
    classNumber: rating.classNumber,
    metricName: rating.metricName as MetricName,
    value: rating.value,
    createdAt:
      "createdAt" in rating && rating.createdAt instanceof Date
        ? rating.createdAt.toISOString()
        : new Date().toISOString(),
  }));
};
