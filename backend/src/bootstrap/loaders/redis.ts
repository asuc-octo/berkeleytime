import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { ErrorsAreMissesCache } from "@apollo/utils.keyvaluecache";
import { Redis } from "ioredis";

export let redisInstance: Redis;

export async function getKeyvCache(namespace: string) {
  // ensure redis is connected
  if (!redisInstance || redisInstance.status !== "ready") {
    throw new Error("Redis is not connected");
  }

  const keyv = new Keyv({ store: new KeyvRedis(redisInstance), namespace });
  const redisCache = new KeyvAdapter(keyv);
  const faultTolerantCache = new ErrorsAreMissesCache(redisCache);

  return faultTolerantCache;
}

async function init() {
  if (!redisInstance) {
    redisInstance = new Redis("redis://localhost:6379");
  }
}

export default init;
