import { RedisClientType, createClient } from "redis";

import { config } from "../../config";

export default async (): Promise<RedisClientType> => {
  const client = createClient({
    url: config.redisUri,
  });

  await client.connect();

  return client as RedisClientType;
};
