import { CatalogModule } from "./generated-types/module-types";
import { catalog } from "./controller"
import { InputMaybe } from "../../generated-types/graphql";

const resolvers: CatalogModule.Resolvers = {
    Query: {
        catalog(_, args: {courseId?: InputMaybe<String>}) {
            return catalog(args);
        }
    },  
}

export default resolvers;