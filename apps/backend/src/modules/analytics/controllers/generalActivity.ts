import {
  CollectionModel,
  PlanModel,
  RatingModel,
  ScheduleModel,
} from "@repo/common/models";

import { RequestContext } from "../../../types/request-context";
import { requireStaffAuth } from "../helpers/staff-auth";

export interface GeneralActivityDataPoint {
  date: string;
  schedulesCreated: number;
  ratingsSubmitted: number;
  gradTraksCreated: number;
  bookmarksAdded: number;
  totalActivity: number;
}

/**
 * Staff-only: Daily activity aggregated across schedules, ratings, GradTrak, bookmarks.
 * Returns one data point per calendar day with counts and totalActivity = sum of the four.
 */
export async function getGeneralActivityAnalytics(
  context: RequestContext,
  days: number
): Promise<GeneralActivityDataPoint[]> {
  await requireStaffAuth(context);

  const now = new Date();
  const rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const rangeStart = new Date(rangeEnd);
  rangeStart.setDate(rangeStart.getDate() - days + 1);
  rangeStart.setHours(0, 0, 0, 0);

  // Build list of all calendar days in range (YYYY-MM-DD)
  const dayKeys: string[] = [];
  for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
    dayKeys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  const zeroMap = new Map<string, number>();
  dayKeys.forEach((key) => zeroMap.set(key, 0));

  // Schedules created per day
  const scheduleCounts = new Map(zeroMap);
  const scheduleAgg = await ScheduleModel.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
    {
      $group: {
        _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } },
        count: { $sum: 1 },
      },
    },
  ]);
  scheduleAgg.forEach((row) => scheduleCounts.set(row._id, row.count));

  // Unique rating submissions per day (one per user+class+term)
  const ratingCounts = new Map(zeroMap);
  const ratingAgg = await RatingModel.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } },
          submissionKey: {
            $concat: [
              "$createdBy",
              "|",
              "$subject",
              "|",
              "$courseNumber",
              "|",
              "$semester",
              "|",
              { $toString: "$year" },
              "|",
              "$classNumber",
            ],
          },
        },
      },
    },
    { $group: { _id: "$_id.date", count: { $sum: 1 } } },
  ]);
  ratingAgg.forEach((row) => ratingCounts.set(row._id, row.count));

  // GradTraks (plans) created per day
  const planCounts = new Map(zeroMap);
  const planAgg = await PlanModel.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
    {
      $group: {
        _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } },
        count: { $sum: 1 },
      },
    },
  ]);
  planAgg.forEach((row) => planCounts.set(row._id, row.count));

  // Bookmarks (class additions) per day
  const bookmarkCounts = new Map(zeroMap);
  const bookmarkAgg = await CollectionModel.aggregate<{ _id: string; count: number }>([
    { $unwind: "$classes" },
    { $match: { "classes.addedAt": { $gte: rangeStart, $lte: rangeEnd } } },
    {
      $group: {
        _id: {
          $dateToString: { date: "$classes.addedAt", format: "%Y-%m-%d" },
        },
        count: { $sum: 1 },
      },
    },
  ]);
  bookmarkAgg.forEach((row) => bookmarkCounts.set(row._id, row.count));

  return dayKeys.map((date) => {
    const schedulesCreated = scheduleCounts.get(date) ?? 0;
    const ratingsSubmitted = ratingCounts.get(date) ?? 0;
    const gradTraksCreated = planCounts.get(date) ?? 0;
    const bookmarksAdded = bookmarkCounts.get(date) ?? 0;
    return {
      date,
      schedulesCreated,
      ratingsSubmitted,
      gradTraksCreated,
      bookmarksAdded,
      totalActivity:
        schedulesCreated + ratingsSubmitted + gradTraksCreated + bookmarksAdded,
    };
  });
}
