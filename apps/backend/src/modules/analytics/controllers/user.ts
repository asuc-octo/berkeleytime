import { UserModel } from "@repo/common/models";

import { ACTIVITY_THRESHOLD } from "../../user/jobs/update-activity-scores";
import { RequestContext } from "../../../types/request-context";
import { requireStaffAuth } from "../helpers/staff-auth";

export const getUserCreationAnalyticsData = async (context: RequestContext) => {
  await requireStaffAuth(context);

  // Get all users with their creation timestamps
  const users = await UserModel.find({})
    .select("createdAt")
    .sort({ createdAt: 1 })
    .lean();

  return users.map((user) => ({
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  }));
};

export const getUserActivityAnalyticsData = async (context: RequestContext) => {
  await requireStaffAuth(context);

  // Get all users with their lastSeenAt and createdAt timestamps
  const users = await UserModel.find({})
    .select("lastSeenAt createdAt")
    .sort({ lastSeenAt: -1 })
    .lean();

  return users.map((user) => ({
    lastSeenAt: user.lastSeenAt?.toISOString() || new Date(0).toISOString(),
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  }));
};

/**
 * Returns active user counts grouped by week or month.
 * A user is "active" if their activityScore >= ACTIVITY_THRESHOLD.
 * Results are bucketed by the start of each period derived from lastSeenAt.
 */
export const getActiveUsersAnalyticsData = async (
  context: RequestContext,
  granularity: "week" | "month"
) => {
  await requireStaffAuth(context);

  const buckets = await UserModel.aggregate<{
    _id: Date;
    count: number;
  }>([
    { $match: { activityScore: { $gte: ACTIVITY_THRESHOLD } } },
    {
      $group: {
        _id: {
          $dateTrunc: { date: "$lastSeenAt", unit: granularity },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return buckets.map((bucket) => ({
    periodStart: bucket._id.toISOString(),
    count: bucket.count,
  }));
};
