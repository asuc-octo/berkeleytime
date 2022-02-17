// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874
// ! FIXME: typedi stuck on version 0.8 due to bug with autogeneration https://github.com/typestack/typedi/issues/173
import "apollo-cache-control";
import { RedisCache } from "apollo-server-cache-redis";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import passport from "passport";
import { dirname } from "path";
import { buildSchema } from "type-graphql";
import { MiddlewareFn } from "type-graphql";
import { Container } from "typedi";
import { URL } from "url";

import { URL_REDIS } from "#src/config";
import { dependencyInjection } from "#src/graphql/dependencyInjection";
import {
  SIS_CourseResolver,
  UserResolver,
} from "#src/graphql/resolvers/_index";

import { getClassForDocument } from "@typegoose/typegoose";

const currentDir = dirname(new URL(import.meta.url).pathname);

const convertDocument = (doc: mongoose.Document) => {
  const convertedDocument = doc.toObject();
  const DocumentClass = getClassForDocument(doc)!;
  Object.setPrototypeOf(convertedDocument, DocumentClass.prototype);
  return convertedDocument;
};

const TypegooseMiddleware: MiddlewareFn = async ({}, next) => {
  const result = await next();
  if (Array.isArray(result)) {
    return result.map((item) =>
      item instanceof mongoose.Model ? convertDocument(item) : item
    );
  }
  return result instanceof mongoose.Model ? convertDocument(result) : result;
};

export default async (app) => {
  dependencyInjection(Container);
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [SIS_CourseResolver, UserResolver],
      authChecker: passport.authenticate("jwt", { session: false }),
      globalMiddlewares: [TypegooseMiddleware],
      emitSchemaFile: {
        path: `${currentDir}/schema.gql`,
        commentDescriptions: true,
        sortedSchema: true,
      },
      container: Container,
      nullableByDefault: true,
    }),

    cache: new RedisCache(URL_REDIS),
    cacheControl: {
      defaultMaxAge: 5,
    },
    introspection: false,
    playground: process.env.NODE_ENV != "prod",
    tracing: false,
  });
  apolloServer.applyMiddleware({ app, path: "/api/graphql" });
};

// Almost working
// import { Base } from "#src/entities/_index"
// import { MikroORM } from "@mikro-orm/core"
// import type { MongoDriver } from "@mikro-orm/mongodb"
// export default async (app) => {
//   const schema = await buildSchema({
//     resolvers: [UserResolver],
//     emitSchemaFile: {
//       path: path.resolve(process.cwd(), "schema.gql"), // process.cwd() assumes calling process takes place from project root
//       commentDescriptions: true,
//       sortedSchema: true,
//     },
//   })
//   const orm = await MikroORM.init<MongoDriver>({
//     clientUrl: URL_MDB,
//     entities: [Base],
//     type: "mongo",
//   })
//   // TODO: re-add redis cache and re-evaluate use of dependency injection
//   const apolloServer = new ApolloServer({
//     schema,
//     cache: new RedisCache(URL_REDIS),
//     cacheControl: {
//       defaultMaxAge: 5,
//     },
//     context: ({ req, res }) => ({
//       req,
//       res,
//       em: orm.em.fork(), // https://mikro-orm.io/docs/identity-map
//     }),
//   })
//   apolloServer.start()
//   apolloServer.applyMiddleware({ app, path: "/api/graphql" })
// }
