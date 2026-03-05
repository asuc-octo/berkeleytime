import { getCatalog, getCatalogFilterOptions } from "./controller";

const resolvers = {
  Query: {
    catalog: async (
      _: any,
      {
        year,
        semester,
        search,
        filters,
        sortBy,
        sortOrder,
        page,
        pageSize,
      }: {
        year: number;
        semester: string;
        search?: string | null;
        filters?: any;
        sortBy?: string | null;
        sortOrder?: string | null;
        page?: number | null;
        pageSize?: number | null;
      }
    ) => {
      return await getCatalog({
        year,
        semester,
        search,
        filters,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });
    },
    catalogFilterOptions: async (
      _: any,
      { year, semester }: { year: number; semester: string }
    ) => {
      return await getCatalogFilterOptions(year, semester);
    },
  },
};

export default resolvers;
