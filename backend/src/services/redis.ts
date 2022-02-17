import redis from "redis";

import { URL_REDIS } from "#src/config";

export const redisClient = redis.createClient({
  url: URL_REDIS,
});
try {
  await redisClient.connect();
  await redisClient.sendCommand([
    "CONFIG",
    "SET",
    "notify-keyspace-events",
    "Ex",
  ]);
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  await subscriber.subscribe(`__keyevent@0__:expired`, (message, channel) => {
    console.info(`${channel}: ${message}`);
  });
} catch (e) {
  console.error(e);
}

redisClient.on("error", (err) => {
  console.error("Redis error: " + err);
});
