import { CatalogModule } from "./generated-types/module-types";
import { getCatalog } from "./controller"

const resolvers: CatalogModule.Resolvers = {
    Query: {
        catalog: (_, { term }) => {
            return getCatalog(term);
        }
    },  
}

export default resolvers;