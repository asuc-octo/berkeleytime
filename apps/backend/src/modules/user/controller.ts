import { GraphQLError } from "graphql";

import { StaffMemberModel, UserModel } from "@repo/common";

import { UpdateUserInput } from "../../generated-types/graphql";
import { RequestContext } from "../../types/request-context";
import { formatUser } from "./formatter";

export const getUser = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const user = await UserModel.findById(context.user._id);

  if (!user) throw new Error("Not found");

  return formatUser(user);
};

export const updateUser = async (context: any, user: UpdateUserInput) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const updatedUser = await UserModel.findByIdAndUpdate(
    context.user._id,
    user,
    { new: true }
  );

  if (!updatedUser) throw new Error("Invalid");

  return formatUser(updatedUser);
};

export const getUserCreationAnalyticsData = async (context: RequestContext) => {
  if (!context.user?._id) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Verify staff member
  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError("Only staff members can access analytics data", {
      extensions: { code: "FORBIDDEN" },
    });
  }

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
