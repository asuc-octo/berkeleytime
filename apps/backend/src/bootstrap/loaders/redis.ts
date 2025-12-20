import { RedisClientType, createClient } from "redis";

import { config } from "../../../../../packages/common/src/utils/config";

export default async (): Promise<RedisClientType> => {
  const client = createClient({
    url: config.redisUri,
  });

  await client.connect();

  return client as RedisClientType;
};
