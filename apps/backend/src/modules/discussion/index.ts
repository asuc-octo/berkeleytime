import { discussionTypeDef } from "@repo/gql-typedefs";

import resolver from "../../discussion/resolver";

export default {
  resolver,
  typeDef: discussionTypeDef,
};
