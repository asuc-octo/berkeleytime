import { GraphQLError } from "graphql";

import { UserModel } from "@repo/common/models";

import { RequestContext } from "../../../types/request-context";
import { ACTIVITY_THRESHOLD } from "../../user/jobs/update-activity-scores";
import {
  ACTIVE_FORMULA_NAME,
  FORMULA_MAP,
  FormulaName,
} from "../../user/jobs/activity-score-formulas";
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
 * Returns activity score distribution computed on-the-fly using the given
 * formula so different formulas can be compared without a DB write.
 */
export const getActivityScoreDistribution = async (
  context: RequestContext,
  formulaName: FormulaName = ACTIVE_FORMULA_NAME
) => {
  await requireStaffAuth(context);

  if (!(formulaName in FORMULA_MAP)) {
    throw new GraphQLError(`Unknown formula: "${formulaName}"`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const formula = FORMULA_MAP[formulaName];

  const users = await UserModel.find({})
    .select("lastSeenAt createdAt")
    .lean();

  const BUCKET_COUNT = 10;
  const counts = new Array<number>(BUCKET_COUNT).fill(0);

  for (const user of users) {
    const score = formula({
      lastSeenAt: user.lastSeenAt ?? new Date(0),
      createdAt: user.createdAt ?? new Date(),
    });
    // Clamp to [0, 1] and map to bucket index; score of exactly 1.0 → last bucket
    const idx = Math.min(Math.floor(score * BUCKET_COUNT), BUCKET_COUNT - 1);
    counts[idx]++;
  }

  const totalUsers = users.length;

  return Array.from({ length: BUCKET_COUNT }, (_, i) => {
    const lowerBound = i / BUCKET_COUNT;
    const upperBound = (i + 1) / BUCKET_COUNT;
    const count = counts[i];
    return {
      bucket: `${lowerBound.toFixed(1)}–${upperBound.toFixed(1)}`,
      count,
      percent: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
    };
  });
};

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
