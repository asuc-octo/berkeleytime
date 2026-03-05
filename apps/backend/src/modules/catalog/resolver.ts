import {
  type CatalogQueryParams,
  getCatalog,
  getCatalogFilterOptions,
} from "./controller";

const resolvers = {
  Query: {
    catalog: async (_: unknown, args: CatalogQueryParams) => {
      return await getCatalog(args);
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
