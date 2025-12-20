import {
  AggregatedMetricsModel,
  PlanModel,
  RatingModel,
  ScheduleModel,
  UserModel,
} from "@repo/common";

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

  return {
    users: {
      totalCount: totalUsers,
      createdLastWeek: usersLastWeek,
      createdLastMonth: usersLastMonth,
    },
    scheduler: {
      uniqueUsersWithSchedules,
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
  };
};
