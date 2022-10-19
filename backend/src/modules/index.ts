import User from "./user";

// Important: Add all your module's resolver in this
export const resolvers = [
  User.resolver,
  // AuthResolver
  // ...
];

export const typeDefs = [User.typeDef];
