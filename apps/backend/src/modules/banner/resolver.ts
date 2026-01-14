import {
  BannerRequestContext,
  CreateBannerInput,
  UpdateBannerInput,
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from "./controller";

const resolvers = {
  Query: {
    allBanners: () => getAllBanners(),
  },

  Mutation: {
    createBanner: (
      _: unknown,
      { input }: { input: CreateBannerInput },
      context: BannerRequestContext
    ) => createBanner(context, input),
    updateBanner: (
      _: unknown,
      { bannerId, input }: { bannerId: string; input: UpdateBannerInput },
      context: BannerRequestContext
    ) => updateBanner(context, bannerId, input),
    deleteBanner: (
      _: unknown,
      { bannerId }: { bannerId: string },
      context: BannerRequestContext
    ) => deleteBanner(context, bannerId),
  },

  Banner: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
