import { CatalogModule } from "./generated-types/module-types";
import { catalog } from "./controller"

const resolvers: CatalogModule.Resolvers = {
    Query: {
        catalog(_parent, args: {courseId?: string}) {
            return catalog(args.courseId)
        }
    },  
}

export default resolvers;