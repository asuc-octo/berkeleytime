import {
  analyticsTypeDef,
  cloudflareTypeDef,
  statsTypeDef,
} from "@repo/gql-typedefs";

import resolver from "./resolver";

export default {
  resolver,
  typeDefs: [analyticsTypeDef, statsTypeDef, cloudflareTypeDef],
};
