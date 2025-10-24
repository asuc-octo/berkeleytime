import { getCatalog } from "./controller";
import { CatalogModule } from "./generated-types/module-types";

const resolvers: CatalogModule.Resolvers = {
  Query: {
    catalog: async (_, { year, semester, query }, __, info) => {
      return await getCatalog(year, semester, info, query);
    },
  },
};

export default resolvers;
