import { resolvers, typeDefs } from "../modules";

// Here goes your schema building bit, doing it this way allows us to use it in the tests as well!
export const buildSchema = () => {
  return { resolvers, typeDefs };
};
