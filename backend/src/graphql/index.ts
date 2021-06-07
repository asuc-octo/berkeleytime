import { ApolloServer } from "apollo-server-express"
import rootPath from "app-root-path"
import { Request } from "express"
import { applyMiddleware } from "graphql-middleware"
import {
  addResolversToSchema,
  GraphQLFileLoader,
  loadSchemaSync,
} from "graphql-tools"

export interface Context {}
const createContext = ({ req }: { req: Request }) => req
const schema = addResolversToSchema({
  schema: loadSchemaSync(rootPath + "/**/*.gql", {
    loaders: [new GraphQLFileLoader()],
  }),
  resolvers: {},
})

export const apolloServer = new ApolloServer({
  schema: applyMiddleware(schema),
  context: createContext,
})
