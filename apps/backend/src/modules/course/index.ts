import { courseTypeDef } from "@repo/gql-typedefs";

import resolver from "./resolver";

export default {
  resolver,
  typeDef: courseTypeDef,
};
