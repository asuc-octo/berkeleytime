import { GraphQLError } from "graphql";

import { StaffMemberModel } from "@repo/common/models";

import { RequestContext } from "../../../types/request-context";

/**
 * Verifies that the request is from an authenticated staff member.
 * Throws appropriate GraphQL errors if not authenticated or not a staff member.
 */
export const requireStaffAuth = async (context: RequestContext) => {
  if (!context.user?._id) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError("Only staff members can access analytics data", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return staffMember;
};
