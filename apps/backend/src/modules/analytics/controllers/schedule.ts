import { Types } from "mongoose";

import { ScheduleModel, UserModel } from "@repo/common";

import { SchedulerAnalyticsDataPoint } from "../../../generated-types/graphql";
import { RequestContext } from "../../../types/request-context";
import { requireStaffAuth } from "../helpers/staff-auth";

export async function getSchedulerAnalyticsData(
  context: RequestContext
): Promise<SchedulerAnalyticsDataPoint[]> {
  await requireStaffAuth(context);

  // Get all schedules
  const schedules = await ScheduleModel.find({}).lean();

  // Get all user IDs from schedules
  const userIds = [...new Set(schedules.map((s) => s.createdBy))];

  // Fetch user emails in bulk
  const users = await UserModel.find({
    _id: { $in: userIds },
  })
    .select({ _id: 1, email: 1 })
    .lean();

  const userEmailMap = new Map(
    users.map((u) => [(u._id as Types.ObjectId).toString(), u.email])
  );

  return schedules.map((schedule) => ({
    scheduleId: (schedule._id as Types.ObjectId).toString(),
    userEmail: userEmailMap.get(schedule.createdBy) || "",
    totalClasses: schedule.classes?.length || 0,
    semester: schedule.semester,
    year: schedule.year,
    createdAt: schedule.createdAt?.toISOString() || new Date().toISOString(),
  }));
}
