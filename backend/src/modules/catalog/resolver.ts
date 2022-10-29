import { CatalogModule } from "./generated-types/module-types";
import catalog from "./resolvers/catalog"

const resolvers: CatalogModule.Resolvers = {
    Query: {
        catalog: catalog
    },
}

export default resolvers;