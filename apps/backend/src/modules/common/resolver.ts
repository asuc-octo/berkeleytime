import { GraphQLScalarType, Kind } from "graphql";
import GraphQLJSON, { GraphQLJSONObject } from "graphql-type-json";

import type { CommonModule } from "./generated-types/module-types";

const resolvers: CommonModule.Resolvers = {
  Query: {
    ping: () => {
      return "pong";
    },
  },

  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,

  // https://stackoverflow.com/questions/59810960/how-can-i-define-date-data-type-in-graphql-schema
  ISODate: new GraphQLScalarType({
    name: "ISODate",
    description: "ISODate custom scalar type",
    parseValue: (value: unknown) => {
      if (typeof value !== "string") return null;
      return new Date(value);
    },
    serialize: (value: unknown) => {
      if (
        typeof value !== "object" ||
        value === null ||
        !("toISOString" in value) ||
        typeof value.toISOString !== "function"
      )
        return null;
      return value.toISOString();
    },
    parseLiteral: (ast) => {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};

export default resolvers;
