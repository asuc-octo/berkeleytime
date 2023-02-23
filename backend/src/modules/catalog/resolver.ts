import { CatalogModule } from "./generated-types/module-types";
import { catalog } from "./controller"

const resolvers: CatalogModule.Resolvers = {
    Query: {
        catalog(parent: CatalogModule.Query, args: {courseId: string}) {
            return catalog(args);
        }
    },  
}

export default resolvers;