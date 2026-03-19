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
    catalogSearch: async (_: unknown, args: CatalogQueryParams) => {
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
