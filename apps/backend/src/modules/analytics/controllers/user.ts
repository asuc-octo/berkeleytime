import { UserModel } from "@repo/common/models";

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
