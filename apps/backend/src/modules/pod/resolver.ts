import {
  CreatePodInput,
  PodRequestContext,
  createPod,
  deletePod,
  getAllPods,
} from "./controller";

const resolvers = {
  Query: {
    allPods: () => getAllPods(),
  },

  Mutation: {
    createPod: (
      _: unknown,
      { input }: { input: CreatePodInput },
      context: PodRequestContext
    ) => createPod(context, input),
    deletePod: (
      _: unknown,
      { podId }: { podId: string },
      context: PodRequestContext
    ) => deletePod(context, podId),
  },

  Pod: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
