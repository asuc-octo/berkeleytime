import { getCatalog } from "./controller";
import { CatalogModule } from "./generated-types/module-types";

const resolvers: CatalogModule.Resolvers = {
  Query: {
    catalog: async (_, { year, semester, query }, __, info) => {
      // const cacheControl = cacheControlFromInfo(info);
      // cacheControl.setCacheHint({ maxAge: 300 });

      return await getCatalog(year, semester, info, query);
    },
  },
};

export default resolvers;
