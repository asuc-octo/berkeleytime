import type { Request } from "express";
import type { RedisClientType } from "redis";

import {
  BannerRequestContext,
  CreateBannerInput,
  UpdateBannerInput,
  createBanner,
  deleteBanner,
  getAllBannersForStaff,
  getVisibleBanners,
  incrementBannerClick,
  incrementBannerDismiss,
  requireStaffMember,
  trackBannerView,
  updateBanner,
} from "./controller";
import {
  getBannerVersionHistory,
  getClickStatsByVersion,
} from "./version-service";

interface GraphQLContext extends BannerRequestContext {
  req: Request;
  redis: RedisClientType;
}

const resolvers = {
  Query: {
    // Public query - only returns visible banners
    allBanners: (_: unknown, __: unknown, context: GraphQLContext) =>
      getVisibleBanners(context.redis),

    // Staff query - returns all banners including hidden ones
    allBannersForStaff: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      await requireStaffMember(context);
      return getAllBannersForStaff(context.redis);
    },

    bannerVersionHistory: async (
      _: unknown,
      { bannerId }: { bannerId: string },
      context: GraphQLContext
    ) => {
      // Verify caller is a staff member
      await requireStaffMember(context);

      const history = await getBannerVersionHistory(bannerId);
      // Format timestamps for GraphQL
      return history.map((entry) => ({
        version: entry.version,
        changedFields: entry.changedFields,
        timestamp:
          entry.timestamp instanceof Date
            ? entry.timestamp.toISOString()
            : entry.timestamp,
        snapshot: entry.snapshot,
      }));
    },

    bannerClickStatsByVersion: async (
      _: unknown,
      {
        bannerId,
        startDate,
        endDate,
      }: { bannerId: string; startDate?: string; endDate?: string },
      context: GraphQLContext
    ) => {
      // Verify caller is a staff member
      await requireStaffMember(context);

      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      return getClickStatsByVersion(bannerId, parsedStartDate, parsedEndDate);
    },
  },

  Mutation: {
    createBanner: (
      _: unknown,
      { input }: { input: CreateBannerInput },
      context: GraphQLContext
    ) => createBanner(context, input),
    updateBanner: (
      _: unknown,
      { bannerId, input }: { bannerId: string; input: UpdateBannerInput },
      context: GraphQLContext
    ) => updateBanner(context, bannerId, input),
    deleteBanner: (
      _: unknown,
      { bannerId }: { bannerId: string },
      context: GraphQLContext
    ) => deleteBanner(context, bannerId),
    incrementBannerClick: (_: unknown, { bannerId }: { bannerId: string }) =>
      incrementBannerClick(bannerId),
    incrementBannerDismiss: (_: unknown, { bannerId }: { bannerId: string }) =>
      incrementBannerDismiss(bannerId),
    trackBannerView: async (
      _: unknown,
      { bannerId }: { bannerId: string },
      context: GraphQLContext
    ) => {
      const result = await trackBannerView(
        bannerId,
        context.req,
        context.redis
      );
      return result.success;
    },
  },

  Banner: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
