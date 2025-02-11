import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import { getTerm, getTerms } from "./controller";
import { TermModule } from "./generated-types/module-types";

const resolvers: TermModule.Resolvers = {
  SessionIdentifier: new GraphQLScalarType({
    name: "SessionIdentifier",
    parseValue: (value) => value,
    serialize: (value) => value,
    description: "Unique session identifier, such as 1 or Q1",
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) return ast.value;

      throw new GraphQLError("Provided value is not a session identifier", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  TermIdentifier: new GraphQLScalarType({
    name: "TermIdentifier",
    parseValue: (value) => value,
    serialize: (value) => value,
    description: "Unique term identifier, such as 2252",
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) return ast.value;

      throw new GraphQLError("Provided value is not a term identifier", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  Query: {
    terms: () => getTerms(),

    term: (_, { id, academicCareerCode }) => getTerm(id, academicCareerCode),
  },
};

export default resolvers;
