import type { Request } from "express";
import type { RedisClientType } from "redis";

import {
  BannerRequestContext,
  CreateBannerInput,
  UpdateBannerInput,
  createBanner,
  deleteBanner,
  getAllBanners,
  incrementBannerClick,
  incrementBannerDismiss,
  trackBannerView,
  updateBanner,
} from "./controller";

interface GraphQLContext extends BannerRequestContext {
  req: Request;
  redis: RedisClientType;
}

const resolvers = {
  Query: {
    allBanners: (_: unknown, __: unknown, context: GraphQLContext) =>
      getAllBanners(context.redis),
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
