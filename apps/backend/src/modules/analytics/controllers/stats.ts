import {
  AggregatedMetricsModel,
  CollectionModel,
  PlanModel,
  RatingModel,
  ScheduleModel,
  UserModel,
} from "@repo/common/models";

export const getStats = async () => {
  // Users stats
  const totalUsers = await UserModel.countDocuments({});

  const usersLastWeek = await UserModel.countDocuments({
    createdAt: {
      $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
    },
  });
  const usersLastMonth = await UserModel.countDocuments({
    createdAt: {
      $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Scheduler stats
  const uniqueUsersWithSchedules = (await ScheduleModel.distinct("createdBy"))
    .length;
  const totalSchedules = await ScheduleModel.countDocuments({});

  // Get last 3 semesters with schedule counts
  // First, get all unique year/semester combinations
  // Semester order for sorting: Fall (0), Spring (1), Summer (2), Winter (3)
  // Most recent semesters first: higher year, then Fall > Spring > Summer > Winter
  const semesterOrder: Record<string, number> = {
    Fall: 0,
    Spring: 1,
    Summer: 2,
    Winter: 3,
  };
  const uniqueSemesters = await ScheduleModel.aggregate([
    {
      $group: {
        _id: {
          year: "$year",
          semester: "$semester",
        },
      },
    },
  ]);

  // Sort by year descending, then by semester order (Fall, Spring, Summer, Winter)
  uniqueSemesters.sort((a, b) => {
    if (a._id.year !== b._id.year) {
      return b._id.year - a._id.year; // Higher year first
    }
    const orderA = semesterOrder[a._id.semester] ?? 999;
    const orderB = semesterOrder[b._id.semester] ?? 999;
    return orderA - orderB; // Fall (0) before Spring (1), etc.
  });

  // Get top 3 semesters
  const last3Semesters = uniqueSemesters.slice(0, 3);

  // Count schedules for each of the last 3 semesters
  const schedulesBySemester = await Promise.all(
    last3Semesters.map(async (sem) => {
      const count = await ScheduleModel.countDocuments({
        year: sem._id.year,
        semester: sem._id.semester,
      });
      return {
        year: sem._id.year,
        semester: sem._id.semester,
        count,
      };
    })
  );

  // Gradtrak stats
  // Total courses across all plans
  const totalCoursesResult = await PlanModel.aggregate([
    { $unwind: "$planTerms" },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: { $size: "$planTerms.courses" } },
      },
    },
  ]);
  const totalCourses = totalCoursesResult[0]?.totalCourses || 0;

  // Max courses in one plan
  const maxCoursesResult = await PlanModel.aggregate([
    { $unwind: "$planTerms" },
    {
      $group: {
        _id: "$_id",
        totalCourses: { $sum: { $size: "$planTerms.courses" } },
      },
    },
    { $sort: { totalCourses: -1 } },
    { $limit: 1 },
  ]);
  const maxCoursesInOnePlan = maxCoursesResult[0]?.totalCourses || 0;

  // Top 3 plans with most courses
  const topPlansResult = await PlanModel.aggregate([
    { $unwind: "$planTerms" },
    {
      $group: {
        _id: "$_id",
        totalCourses: { $sum: { $size: "$planTerms.courses" } },
      },
    },
    { $sort: { totalCourses: -1 } },
    { $limit: 3 },
  ]);
  const topPlansWithMostCourses = topPlansResult.map((plan) => ({
    planId: plan._id.toString(),
    totalCourses: plan.totalCourses,
  }));

  // Histogram of courses
  const histogramResult = await PlanModel.aggregate([
    { $unwind: "$planTerms" },
    {
      $group: {
        _id: "$_id",
        totalCourses: { $sum: { $size: "$planTerms.courses" } },
      },
    },
    {
      $bucket: {
        groupBy: "$totalCourses",
        boundaries: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
        default: "40+",
        output: { count: { $sum: 1 } },
      },
    },
  ]);
  const courseHistogram = histogramResult.map((bucket) => ({
    range:
      bucket._id === "40+"
        ? "40+"
        : `${bucket._id}-${(bucket._id as number) + 3}`,
    count: bucket.count,
  }));

  // Ratings stats
  // Number of classes with ratings
  const classesWithRatingsResult = await AggregatedMetricsModel.aggregate([
    {
      $group: {
        _id: {
          subject: "$subject",
          courseNumber: "$courseNumbers",
        },
      },
    },
    { $count: "uniqueSubjectCourseCount" },
  ]);
  const classesWithRatings =
    classesWithRatingsResult[0]?.uniqueSubjectCourseCount || 0;

  // Course with most ratings
  const courseWithMostRatingsResult = await AggregatedMetricsModel.aggregate([
    {
      $group: {
        _id: {
          subject: "$subject",
          courseNumber: "$courseNumber",
          metricName: "$metricName",
        },
        totalRatings: { $sum: "$categoryCount" },
      },
    },
    { $sort: { totalRatings: -1 } },
    { $limit: 1 },
  ]);
  const courseWithMostRatings = courseWithMostRatingsResult[0]
    ? {
        subject: courseWithMostRatingsResult[0]._id.subject,
        courseNumber: courseWithMostRatingsResult[0]._id.courseNumber,
        totalRatings: courseWithMostRatingsResult[0].totalRatings,
      }
    : null;

  // Class with most ratings
  const classWithMostRatingsResult = await AggregatedMetricsModel.aggregate([
    {
      $group: {
        _id: {
          subject: "$subject",
          courseNumber: "$courseNumber",
          semester: "$semester",
          year: "$year",
          classNumber: "$classNumber",
          metricName: "$metricName",
        },
        totalRatings: { $sum: "$categoryCount" },
      },
    },
    { $sort: { totalRatings: -1 } },
    { $limit: 1 },
  ]);
  const classWithMostRatings = classWithMostRatingsResult[0]
    ? {
        subject: classWithMostRatingsResult[0]._id.subject,
        courseNumber: classWithMostRatingsResult[0]._id.courseNumber,
        semester: classWithMostRatingsResult[0]._id.semester,
        year: classWithMostRatingsResult[0]._id.year,
        classNumber: classWithMostRatingsResult[0]._id.classNumber,
        totalRatings: classWithMostRatingsResult[0].totalRatings,
      }
    : null;

  // Unique createdBy
  const uniqueCreatedBy = (await RatingModel.distinct("createdBy")).length;

  // Collections stats
  const nonSystemCollectionsCount = await CollectionModel.countDocuments({
    isSystem: { $ne: true },
  });
  const uniqueUsersWithNonSystemCollections = (
    await CollectionModel.distinct("createdBy", { isSystem: { $ne: true } })
  ).length;

  return {
    users: {
      totalCount: totalUsers,
      createdLastWeek: usersLastWeek,
      createdLastMonth: usersLastMonth,
    },
    scheduler: {
      uniqueUsersWithSchedules,
      totalSchedules,
      schedulesBySemester: schedulesBySemester,
    },
    gradtrak: {
      totalCourses,
      maxCoursesInOnePlan,
      topPlansWithMostCourses,
      courseHistogram,
    },
    ratings: {
      classesWithRatings,
      courseWithMostRatings,
      classWithMostRatings,
      uniqueCreatedBy,
    },
    collections: {
      nonSystemCollectionsCount,
      uniqueUsersWithNonSystemCollections,
    },
  };
};
