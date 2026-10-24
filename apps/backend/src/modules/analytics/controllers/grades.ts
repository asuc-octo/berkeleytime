import { TrackingEventModel } from "@repo/common/models";

import { RequestContext } from "../../../types/request-context";
import { requireStaffAuth } from "../helpers/staff-auth";

export interface GradesSessionUsersDataPoint {
  date: string;
  loggedInUsers: number;
  anonymousUsers: number;
  totalUsers: number;
}

export interface GradesSessionUsersData {
  dataPoints: GradesSessionUsersDataPoint[];
  uniqueLoggedInUsers: number;
  uniqueAnonymousUsers: number;
  uniqueUsers: number;
}

export async function getGradesSessionUsersData(
  context: RequestContext,
  days: number
): Promise<GradesSessionUsersData> {
  await requireStaffAuth(context);

  const now = new Date();
  const rangeEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  const rangeStart = new Date(rangeEnd);
  rangeStart.setDate(rangeStart.getDate() - days + 1);
  rangeStart.setHours(0, 0, 0, 0);

  const dayKeys: string[] = [];
  for (
    let d = new Date(rangeStart);
    d <= rangeEnd;
    d.setDate(d.getDate() + 1)
  ) {
    dayKeys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  // mongo queries
  const [result] = await TrackingEventModel.aggregate<{
    daily: { _id: string; loggedInUsers: number; anonymousUsers: number }[];
    totals: { loggedIn: boolean; count: number }[];
  }>([
    {
      $match: {
        eventType: "session_start",
        targetType: "grades",
        timestamp: { $gte: rangeStart, $lte: rangeEnd },
      },
    },
    {
      $project: {
        date: { $dateToString: { date: "$timestamp", format: "%Y-%m-%d" } },
        loggedIn: { $gt: ["$userId", null] },
        visitor: { $ifNull: ["$userId", "$ipHash"] },
      },
    },
    {
      $facet: {
        // One row per (day, visitor), then count visitors per day
        daily: [
          {
            $group: {
              _id: { date: "$date", visitor: "$visitor" },
              loggedIn: { $first: "$loggedIn" },
            },
          },
          {
            $group: {
              _id: "$_id.date",
              loggedInUsers: { $sum: { $cond: ["$loggedIn", 1, 0] } },
              anonymousUsers: { $sum: { $cond: ["$loggedIn", 0, 1] } },
            },
          },
        ],
        // Unique across the whole range, so a returning user counts once
        totals: [
          {
            $group: {
              _id: "$visitor",
              loggedIn: { $first: "$loggedIn" },
            },
          },
          { $group: { _id: "$loggedIn", count: { $sum: 1 } } },
          { $project: { _id: 0, loggedIn: "$_id", count: 1 } },
        ],
      },
    },
  ]);

  const dailyByDate = new Map(result.daily.map((row) => [row._id, row]));

  const dataPoints = dayKeys.map((date) => {
    const loggedInUsers = dailyByDate.get(date)?.loggedInUsers ?? 0;
    const anonymousUsers = dailyByDate.get(date)?.anonymousUsers ?? 0;
    return {
      date,
      loggedInUsers,
      anonymousUsers,
      totalUsers: loggedInUsers + anonymousUsers,
    };
  });

  const uniqueLoggedInUsers =
    result.totals.find((row) => row.loggedIn)?.count ?? 0;
  const uniqueAnonymousUsers =
    result.totals.find((row) => !row.loggedIn)?.count ?? 0;

  return {
    dataPoints,
    uniqueLoggedInUsers,
    uniqueAnonymousUsers,
    uniqueUsers: uniqueLoggedInUsers + uniqueAnonymousUsers,
  };
}

export interface GradesPercentileSliderUsage {
  usedSessions: number;
  touchedSessions: number;
  unusedSessions: number;
  totalSessions: number;
  usagePercent: number;
  touchPercent: number;
}

export async function getGradesPercentileSliderUsage(
  context: RequestContext,
  days: number
): Promise<GradesPercentileSliderUsage> {
  await requireStaffAuth(context);

  const rangeEnd = new Date();
  rangeEnd.setHours(23, 59, 59, 999);
  const rangeStart = new Date(rangeEnd);
  rangeStart.setDate(rangeStart.getDate() - days + 1);
  rangeStart.setHours(0, 0, 0, 0);

  const [result] = await TrackingEventModel.aggregate<{
    usedSessions: number;
    touchedSessions: number;
    totalSessions: number;
  }>([
    {
      $match: {
        eventType: "session_end",
        targetType: "grades",
        targetId: { $type: "string" },
        timestamp: { $gte: rangeStart, $lte: rangeEnd },
        // Compare both rates over the same cohort; older touch-only sessions
        // cannot tell us whether a meaningful adjustment occurred.
        "metadata.percentileSliderAdjusted": { $in: [true, false] },
      },
    },
    {
      // targetId pairs the feature's start/end, unlike the server sessionId.
      // Count each completed Grades session once, even if an event is replayed.
      $group: {
        _id: "$targetId",
        used: { $max: { $cond: ["$metadata.percentileSliderAdjusted", 1, 0] } },
        touched: { $max: { $cond: ["$metadata.percentileSliderUsed", 1, 0] } },
      },
    },
    {
      $group: {
        _id: null,
        usedSessions: { $sum: "$used" },
        touchedSessions: { $sum: "$touched" },
        totalSessions: { $sum: 1 },
      },
    },
  ]);

  const usedSessions = result?.usedSessions ?? 0;
  const touchedSessions = result?.touchedSessions ?? 0;
  const totalSessions = result?.totalSessions ?? 0;
  return {
    usedSessions,
    touchedSessions,
    unusedSessions: totalSessions - usedSessions,
    totalSessions,
    usagePercent: totalSessions > 0 ? (usedSessions / totalSessions) * 100 : 0,
    touchPercent:
      totalSessions > 0 ? (touchedSessions / totalSessions) * 100 : 0,
  };
}
