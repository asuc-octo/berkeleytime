import { Resolvers } from "../generated-types/graphql";
import User from "./user";
import Schedule from "./schedule";

const modules = [User, Schedule];

// Important: Add all your module's resolver in this
export const resolvers: Resolvers = modules.reduce(
  (acc, module) => ({ ...acc, ...module.resolver }),
  {}
);

export const typeDefs = modules.map((module) => module.typeDef);
