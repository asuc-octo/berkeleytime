import { getCatalog } from "./controller";
import { CatalogModule } from "./generated-types/module-types";

const resolvers: CatalogModule.Resolvers = {
  Query: {
    catalog: async (_, { year, semester, limit, offset }, __, info) => {
      return await getCatalog(year, semester, info, limit, offset);
    },
  },
};

export default resolvers;
