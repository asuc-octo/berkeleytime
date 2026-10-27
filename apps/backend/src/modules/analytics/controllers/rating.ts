import { RatingModel, ReviewModel, UserModel } from "@repo/common/models";

import { MetricName } from "../../../generated-types/graphql";
import { RequestContext } from "../../../types/request-context";
import { requireStaffAuth } from "../helpers/staff-auth";

/**
 * Staff-only endpoint to get minimal rating data for analytics timeseries
 * Returns only the data needed to compute:
 * - Total ratings over time
 * - Unique courses over time
 * - Unique users over time
 *
 * Filters for "Difficulty" metric only to count unique submissions
 * (each user submission creates one entry per metric, so we pick one to avoid overcounting)
 */
export const getRatingAnalyticsData = async (context: RequestContext) => {
  await requireStaffAuth(context);

  // Fetch ratings with only the fields we need, sorted by creation date
  // Filter for Difficulty metric only to count unique submissions
  const ratings = await RatingModel.find({ metricName: "Difficulty" })
    .select("createdBy subject courseNumber createdAt")
    .sort({ createdAt: 1 })
    .lean();

  // Get unique user IDs and look up their emails
  const userIds = [...new Set(ratings.map((r) => r.createdBy))];
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select("_id email")
    .lean();
  const userEmailMap = new Map(
    users.map((u) => [u._id.toString(), u.email as string])
  );

  return ratings.map((rating) => ({
    createdAt: rating.createdAt.toISOString(),
    userEmail: userEmailMap.get(rating.createdBy.toString()) || "unknown",
    courseKey: `${rating.subject} ${rating.courseNumber}`,
  }));
};

/**
 * Staff-only endpoint to get rating metric values for analytics
 * Returns all rating metrics (excluding boolean metrics like Recording/Attendance)
 * with their values to compute average scores over time
 */
export const getRatingMetricsAnalyticsData = async (
  context: RequestContext
) => {
  await requireStaffAuth(context);

  // Fetch all numeric rating metrics (1-5 scale), excluding boolean metrics
  const ratings = await RatingModel.find({
    metricName: { $in: ["Usefulness", "Difficulty", "Workload"] },
  })
    .select("metricName value createdAt subject courseNumber")
    .sort({ createdAt: 1 })
    .lean();

  return ratings.map((rating) => ({
    createdAt: rating.createdAt.toISOString(),
    metricName: rating.metricName as MetricName,
    value: rating.value,
    courseKey: `${rating.subject} ${rating.courseNumber}`,
  }));
};

/**
 * Staff-only endpoint to get optional response analytics data
 * Returns data about whether optional fields (Recording, Attendance) were filled
 * for each unique rating submission (user + class + term)
 */
export const getOptionalResponseAnalyticsData = async (
  context: RequestContext
) => {
  await requireStaffAuth(context);

  // Get all ratings to analyze optional field completion
  // We use Difficulty as the base metric (every submission has it)
  // Then check if Recording or Attendance exists for that submission
  const allRatings = await RatingModel.find({})
    .select(
      "createdBy subject courseNumber semester year classNumber metricName createdAt"
    )
    .lean();

  // Group by unique submission (user + class + term)
  const submissionMap = new Map<
    string,
    { createdAt: Date; hasOptional: boolean }
  >();

  allRatings.forEach((rating) => {
    const key = `${rating.createdBy}-${rating.subject}-${rating.courseNumber}-${rating.semester}-${rating.year}-${rating.classNumber}`;
    const existing = submissionMap.get(key);
    const createdAt = rating.createdAt as Date;
    const isOptional =
      rating.metricName === "Recording" || rating.metricName === "Attendance";

    if (!existing) {
      submissionMap.set(key, {
        createdAt,
        hasOptional: isOptional,
      });
    } else {
      // Use earliest createdAt and set hasOptional if any optional metric exists
      if (createdAt < existing.createdAt) {
        existing.createdAt = createdAt;
      }
      if (isOptional) {
        existing.hasOptional = true;
      }
    }
  });

  // Convert to array and sort by createdAt
  const dataPoints = Array.from(submissionMap.values())
    .map((s) => ({
      createdAt: s.createdAt.toISOString(),
      hasOptional: s.hasOptional,
    }))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  return dataPoints;
};

/**
 * Staff-only endpoint for written review analytics
 * A review counts as written if it is live (valid is not false, which also
 * matches legacy docs missing the field) and has a non-blank title or content.
 * Cleared reviews are soft-deleted with their old text kept, so the valid
 * check is what excludes them.
 */
export const getWrittenReviewAnalyticsData = async (
  context: RequestContext
) => {
  await requireStaffAuth(context);

  const writtenReviewMatch = {
    valid: { $ne: false },
    $or: [{ reviewTitle: /\S/ }, { reviewContent: /\S/ }],
  };

  const [reviews, classCounts] = await Promise.all([
    ReviewModel.find(writtenReviewMatch)
      .select("createdAt")
      .sort({ createdAt: 1 })
      .lean(),
    // Grouped by subject + course number, the same key the catalog uses to
    // list a course's reviews across all of its offerings
    ReviewModel.aggregate<{
      _id: { subject: string; courseNumber: string };
      count: number;
    }>([
      { $match: writtenReviewMatch },
      {
        $group: {
          _id: { subject: "$subject", courseNumber: "$courseNumber" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, "_id.subject": 1, "_id.courseNumber": 1 } },
    ]),
  ]);

  return {
    totalWrittenReviews: reviews.length,
    reviewDates: reviews.map((r) => r.createdAt.toISOString()),
    classes: classCounts.map((c) => ({ ...c._id, count: c.count })),
  };
};
