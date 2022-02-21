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
import {
  dependencyInjection,
  resolvers,
} from "#src/graphql/dependencyInjection";

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
      resolvers,
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
    introspection: true,
    playground: process.env.NODE_ENV != "prod",
    tracing: false,
  });
  apolloServer.applyMiddleware({ app, path: "/api/graphql" });
};
