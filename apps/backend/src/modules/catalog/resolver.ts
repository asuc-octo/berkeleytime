import { getCatalog } from "./controller";
import { CatalogModule } from "./generated-types/module-types";

const resolvers: CatalogModule.Resolvers = {
  Query: {
    catalog: async (_, { term }, __, info) => {
      // const cacheControl = cacheControlFromInfo(info);
      // cacheControl.setCacheHint({ maxAge: 300 });

      return await getCatalog(term.year, term.semester, info);
    },
  },
};

export default resolvers;
