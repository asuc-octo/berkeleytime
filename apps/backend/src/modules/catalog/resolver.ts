import type { GraphQLResolveInfo } from "graphql";

import {
  type CatalogQueryParams,
  getCatalogClassIdentities,
  getCatalogFilterOptions,
  getCatalogLegacy,
  getCatalogSearch,
} from "./controller";

const resolvers = {
  Query: {
    catalog: async (
      _: unknown,
      { year, semester }: { year: number; semester: string },
      __: unknown,
      info: GraphQLResolveInfo
    ) => {
      return await getCatalogLegacy(year, semester, info);
    },
    catalogSearch: async (
      _: unknown,
      args: CatalogQueryParams,
      __: unknown,
      info: GraphQLResolveInfo
    ) => {
      if (args.recentClicks && args.recentClicks.length > 0) {
        (info as GraphQLResolveInfo & { cacheControl: { setCacheHint: (hint: { maxAge: number; scope: string }) => void } }).cacheControl.setCacheHint({
          maxAge: 0,
          scope: "PRIVATE",
        });
      }
      return await getCatalogSearch(args);
    },
    catalogClassIdentities: async (
      _: unknown,
      { year, semester }: { year: number; semester: string }
    ) => {
      return await getCatalogClassIdentities(year, semester);
    },
    catalogFilterOptions: async (
      _: unknown,
      { year, semester }: { year: number; semester: string }
    ) => {
      return await getCatalogFilterOptions(year, semester);
    },
  },
};

export default resolvers;
