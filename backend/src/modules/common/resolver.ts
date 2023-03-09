import GraphQLJSON, { GraphQLJSONObject } from "graphql-type-json";


const resolvers = {
    Query: {
        ping() {
            return "pong";
        }
    },
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
}

export default resolvers;