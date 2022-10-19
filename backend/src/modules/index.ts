import { Resolvers } from "../generated-types/graphql";
import User from "./user";

const modules = [User];

// Important: Add all your module's resolver in this
export const resolvers: Resolvers = modules.reduce(
  (acc, module) => ({ ...acc, ...module.resolver }),
  {}
);

export const typeDefs = modules.map((module) => module.typeDef);
