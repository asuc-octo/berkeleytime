import {
  CreateRouteRedirectInput,
  RouteRedirectRequestContext,
  UpdateRouteRedirectInput,
  createRouteRedirect,
  deleteRouteRedirect,
  getAllRouteRedirects,
  updateRouteRedirect,
} from "./controller";

const resolvers = {
  Query: {
    allRouteRedirects: () => getAllRouteRedirects(),
  },

  Mutation: {
    createRouteRedirect: (
      _: unknown,
      { input }: { input: CreateRouteRedirectInput },
      context: RouteRedirectRequestContext
    ) => createRouteRedirect(context, input),
    updateRouteRedirect: (
      _: unknown,
      {
        redirectId,
        input,
      }: { redirectId: string; input: UpdateRouteRedirectInput },
      context: RouteRedirectRequestContext
    ) => updateRouteRedirect(context, redirectId, input),
    deleteRouteRedirect: (
      _: unknown,
      { redirectId }: { redirectId: string },
      context: RouteRedirectRequestContext
    ) => deleteRouteRedirect(context, redirectId),
  },

  RouteRedirect: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
