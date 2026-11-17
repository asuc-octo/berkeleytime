import { RedisClientType, createClient } from "redis";

import log from "./logger";

const ERROR_LOG_INTERVAL_MS = 10_000;

/**
 * node-redis emits "error" whenever the connection drops and on every failed
 * reconnect attempt. With no listener, Node treats the event as an uncaught
 * exception and exits, so a Redis restart (for example an OOM kill) crashed
 * every backend pod at once. With a listener the client keeps reconnecting,
 * commands wait in its offline queue, and the API recovers when Redis is back.
 *
 * Reconnect attempts can fail several times a second, so errors are logged at
 * most once every 10 seconds, with the number of errors skipped since.
 */
export const createRedisClient = (url: string): RedisClientType => {
  const client = createClient({ url });

  let lastLoggedAt = 0;
  let skipped = 0;

  client.on("error", (err: Error) => {
    const now = Date.now();
    if (now - lastLoggedAt < ERROR_LOG_INTERVAL_MS) {
      skipped += 1;
      return;
    }
    log.error({ err: err.message, skipped }, "Redis error, reconnecting");
    lastLoggedAt = now;
    skipped = 0;
  });

  client.on("ready", () => {
    log.info("Redis connection ready");
  });

  return client as RedisClientType;
};
