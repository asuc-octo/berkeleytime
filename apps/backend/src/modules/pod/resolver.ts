import { CreatePodInput, createPod, deletePod, getAllPods } from "./controller";

const resolvers = {
  Query: {
    allPods: () => getAllPods(),
  },

  Mutation: {
    createPod: (
      _: unknown,
      { input }: { input: CreatePodInput },
      context: any
    ) => createPod(context, input),
    deletePod: (_: unknown, { podId }: { podId: string }, context: any) =>
      deletePod(context, podId),
  },

  Pod: {
    id: (parent: any) => parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
