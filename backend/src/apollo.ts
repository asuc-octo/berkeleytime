// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874
// ! FIXME: typedi stuck on version 0.8 due to bug with autogeneration https://github.com/typestack/typedi/issues/173
import "apollo-cache-control"
import { RedisCache } from "apollo-server-cache-redis"
import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import mongoose from "mongoose"
import passport from "passport"
import { dirname } from "path"
import { buildSchema } from "type-graphql"
import { Resolver, Query } from "type-graphql"
import { MiddlewareFn } from "type-graphql"
import { Container } from "typedi"
import { Service, Inject } from "typedi"

import { URL_DOMAIN, URL_REDIS } from "#src/config"
import { User, UserSchema } from "#src/models/_index"
import { redisClient } from "#src/services/redis"

import { getClassForDocument } from "@typegoose/typegoose"

// @ts-ignore
const currentDir = dirname(new URL(import.meta.url).pathname)

@Service()
class UserService {
  constructor(@Inject("userModel") private readonly UserModel) {}

  async getAll() {
    return this.UserModel.find()
  }
}

const TypegooseMiddleware: MiddlewareFn = async ({}, next) => {
  const result = await next()
  if (Array.isArray(result)) {
    return result.map((item) =>
      item instanceof mongoose.Model ? convertDocument(item) : item
    )
  }
  if (result instanceof mongoose.Model) {
    return convertDocument(result)
  }
  return result
}

function convertDocument(doc: mongoose.Document) {
  const convertedDocument = doc.toObject()
  const DocumentClass = getClassForDocument(doc)!
  Object.setPrototypeOf(convertedDocument, DocumentClass.prototype)
  return convertedDocument
}

@Resolver()
class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserSchema])
  async users() {
    return this.userService.getAll()
  }
}

const configureApolloServer = async ({ redis, Container }) => {
  return new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      authChecker: passport.authenticate("jwt", { session: false }),
      globalMiddlewares: [TypegooseMiddleware],
      emitSchemaFile: {
        path: `${currentDir}/schema.gql`,
        commentDescriptions: true,
        sortedSchema: false,
      },
      container: Container,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
    formatResponse: (response) => {
      return { ...response }
    },
    cache: new RedisCache(URL_REDIS),
    cacheControl: {
      defaultMaxAge: 5,
    },
    introspection: true,
    playground: process.env.NODE_ENV != "prod",
    tracing: true,
  })
}

const dependencyInjector = (Container, entities: { name: string; model }[]) => {
  try {
    entities.forEach((m) => {
      Container.set(m.name, m.model)
    })
    return true
  } catch (err) {
    throw new Error(err)
  }
}

export default async (app) => {
  if (process.env.NODE_ENV == "prod") {
    app.use(
      cors({
        origin: URL_DOMAIN,
        credentials: true,
      })
    )
  } else {
    app.use(cors())
  }

  await dependencyInjector(Container, [{ name: "userModel", model: User }])
  const apolloServer = await configureApolloServer({
    redis: redisClient,
    Container,
  })
  apolloServer.applyMiddleware({ app, path: "/api/graphql" })
}
