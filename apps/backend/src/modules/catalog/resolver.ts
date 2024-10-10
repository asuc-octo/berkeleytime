import { getCatalog } from "./controller";
import { CatalogModule } from "./generated-types/module-types";

const resolvers: CatalogModule.Resolvers = {
  Query: {
    catalog: (_, { term }, __, info) =>
      getCatalog(term.year, term.semester, info),
  },
};

export default resolvers;
