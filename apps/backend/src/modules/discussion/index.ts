import { discussionTypeDefs } from "@repo/gql-typedefs";
import resolver from "./resolver";

export default {
  typeDef: discussionTypeDefs,
  resolver,
};
