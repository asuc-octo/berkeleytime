import { GraphQLScalarType, Kind } from "graphql";
import GraphQLJSON, { GraphQLJSONObject } from "graphql-type-json";

const resolvers = {
    Query: {
        ping: () => {
            return "pong";
        }
    },

    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,

    // https://stackoverflow.com/questions/59810960/how-can-i-define-date-data-type-in-graphql-schema
    ISODate: new GraphQLScalarType({
        name: "ISODate",
        description: "ISODate custom scalar type",
        parseValue: (value: any) => {
            return new Date(value);
        },
        serialize: (value: any) => {
            return value.toISOString();
        },
        parseLiteral: (ast) => {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value)
            }
            return null;
        }
    }),
}

export default resolvers;