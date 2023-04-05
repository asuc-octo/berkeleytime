import type { GraphQLSchema } from "graphql";
import authDirective from "./auth";

const directives = [authDirective];

export default function applyDirectives(schema: GraphQLSchema) {
  return directives.reduce((schema, directive) => directive(schema), schema);
}
