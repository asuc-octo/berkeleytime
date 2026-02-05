import {
  AdTargetRequestContext,
  CreateAdTargetInput,
  UpdateAdTargetInput,
  createAdTarget,
  deleteAdTarget,
  getAdTargetPreview,
  getAllAdTargets,
  updateAdTarget,
} from "./controller";

const resolvers = {
  Query: {
    allAdTargets: (_: unknown, __: unknown, context: AdTargetRequestContext) => 
      getAllAdTargets(context),
    adTargetPreview: (
      _: unknown,
      args: Parameters<typeof getAdTargetPreview>[1],
      context: AdTargetRequestContext
    ) => getAdTargetPreview(context, args),
  },

  Mutation: {
    createAdTarget: (
      _: unknown,
      { input }: { input: CreateAdTargetInput },
      context: AdTargetRequestContext
    ) => createAdTarget(context, input),
    updateAdTarget: (
      _: unknown,
      { adTargetId, input }: { adTargetId: string; input: UpdateAdTargetInput },
      context: AdTargetRequestContext
    ) => updateAdTarget(context, adTargetId, input),
    deleteAdTarget: (
      _: unknown,
      { adTargetId }: { adTargetId: string },
      context: AdTargetRequestContext
    ) => deleteAdTarget(context, adTargetId),
  },
};

export default resolvers;
