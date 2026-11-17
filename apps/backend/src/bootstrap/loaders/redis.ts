import { RedisClientType } from "redis";

import { config } from "../../../../../packages/common/src/utils/config";
import { createRedisClient } from "../../lib/redis-client";

export default async (): Promise<RedisClientType> => {
  const client = createRedisClient(config.redisUri);

  await client.connect();

  return client;
};
