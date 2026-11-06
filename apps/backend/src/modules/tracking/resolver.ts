import type { Request } from "express";
import { GraphQLError } from "graphql";
import type { RedisClientType } from "redis";

import { StaffMemberModel } from "@repo/common/models";

import { getTrackingEventsTimeSeries } from "./controller";
import { bufferTrackingEvents } from "./ingest";
import { InvalidTrackingBatch, TrackingEventInput } from "./validation";

interface RequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
  req: Request;
  redis: RedisClientType;
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
  Mutation: {
    trackEvents: async (
      _: unknown,
      { events }: { events: TrackingEventInput[] },
      context: RequestContext
    ) => {
      if (events.length === 0) return true;

      if (events.length > 50) {
        throw new GraphQLError("Maximum 50 events per batch", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        await bufferTrackingEvents(context.redis, context.req, events);
      } catch (error) {
        if (error instanceof InvalidTrackingBatch) {
          throw new GraphQLError(error.message, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        throw error;
      }
      return true;
    },
  },

  Query: {
    trackingEventsTimeSeries: async (
      _: unknown,
      {
        eventType,
        targetType,
        targetId,
        startDate,
        endDate,
      }: {
        eventType?: string;
        targetType?: string;
        targetId?: string;
        startDate?: string;
        endDate?: string;
      },
      context: RequestContext
    ) => {
      await requireStaffMember(context);

      return getTrackingEventsTimeSeries(
        eventType,
        targetType,
        targetId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    },
  },
};

export default resolvers;
