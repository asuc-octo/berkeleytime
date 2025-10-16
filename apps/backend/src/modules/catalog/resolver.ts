import { getCatalog } from "./controller";
import { CatalogModule } from "./generated-types/module-types";

const resolvers: CatalogModule.Resolvers = {
  Query: {
    catalog: async (_, { year, semester, query, refresh }, { redis }, info) => {
      return await getCatalog(year, semester, info, query, {
        refresh,
        cache: redis,
      });
    },
  },
};

export default resolvers;
