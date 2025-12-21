import { UserModel } from "@repo/common";

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
    createdAt:
      (user as any).createdAt?.toISOString() || new Date().toISOString(),
  }));
};
