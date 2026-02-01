import { GraphQLError } from "graphql";

import { StaffMemberModel } from "@repo/common/models";

import { TargetType, getClickEvents, getClickStats } from "./controller";

interface RequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

const requireStaffMember = async (context: RequestContext) => {
  if (!context.user?._id) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError("Only staff members can perform this action", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return staffMember;
};

const resolvers = {
  Query: {
    clickEvents: async (
      _: unknown,
      {
        targetId,
        targetType,
        startDate,
        endDate,
        limit,
        offset,
      }: {
        targetId: string;
        targetType: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
      },
      context: RequestContext
    ) => {
      await requireStaffMember(context);

      if (targetType !== "banner" && targetType !== "redirect") {
        throw new GraphQLError(
          "Invalid targetType. Must be 'banner' or 'redirect'",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      const result = await getClickEvents(
        targetId,
        targetType as TargetType,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        limit ?? 100,
        offset ?? 0
      );

      return {
        events: result.events.map((event) => ({
          id: event._id.toString(),
          targetId: event.targetId.toString(),
          targetType: event.targetType,
          timestamp: event.timestamp.toISOString(),
          ipHash: event.ipHash,
          userAgent: event.userAgent,
          referrer: event.referrer,
          sessionFingerprint: event.sessionFingerprint,
        })),
        totalCount: result.totalCount,
        hasMore: result.hasMore,
      };
    },

    clickStats: async (
      _: unknown,
      {
        targetId,
        targetType,
        startDate,
        endDate,
      }: {
        targetId: string;
        targetType: string;
        startDate?: string;
        endDate?: string;
      },
      context: RequestContext
    ) => {
      await requireStaffMember(context);

      if (targetType !== "banner" && targetType !== "redirect") {
        throw new GraphQLError(
          "Invalid targetType. Must be 'banner' or 'redirect'",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      return getClickStats(
        targetId,
        targetType as TargetType,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    },
  },

  ClickEvent: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
