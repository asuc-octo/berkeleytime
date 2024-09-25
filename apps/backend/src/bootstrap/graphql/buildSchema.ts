import { mergeSchemas } from "@graphql-tools/schema";

import { resolvers, typeDefs } from "../../modules";
import applyDirectives from "./directives";

// Here goes your schema building bit, doing it this way allows us to use it in the tests as well!
export const buildSchema = () => {
  return applyDirectives(mergeSchemas({ typeDefs, resolvers }));
};
