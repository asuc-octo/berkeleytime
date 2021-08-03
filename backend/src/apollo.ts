// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874
// ! FIXME: typedi stuck on version 0.8 due to bug with autogeneration https://github.com/typestack/typedi/issues/173
import "apollo-cache-control"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { Resolver, Query } from "type-graphql"
import { Service, Inject } from "typedi"

import { MIKRO_ORM_CONFIG } from "#src/config"
import { UserSchema } from "#src/models/_index"
import { MikroORM } from "@mikro-orm/core"
import path from "path"

@Service()
class UserService {
  constructor(@Inject("userModel") private readonly UserModel) {}

  async getAll() {
    return this.UserModel.find()
  }
}

@Resolver()
class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserSchema])
  async users() {
    return this.userService.getAll()
  }
}

export default async (app) => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: {
      path: path.resolve(process.cwd(), 'schema.gql'), // process.cwd() assumes calling process takes place from project root
      commentDescriptions: true,
      sortedSchema: false,
    },
  })

  const orm = await MikroORM.init(MIKRO_ORM_CONFIG)

  // TODO: re-add redis cache and re-evaluate use of dependency injection
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      em: orm.em.fork() // https://mikro-orm.io/docs/identity-map
    }),
  })
    
  apolloServer.start()
  apolloServer.applyMiddleware({ app, path: "/api/graphql" })
}
