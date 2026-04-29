import type { RedisClientType } from "redis";

import { flushTrackingEvents } from "../controller";

const FLUSH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const STARTUP_DELAY_MS = 90 * 1000; // 1.5 minutes (staggered from other jobs)
const LOCK_KEY = "tracking-events-flush-lock";
const LOCK_TTL_S = 10 * 60; // 10 minutes — long enough to cover a slow flush

export const startTrackingEventsFlushJob = (redis: RedisClientType) => {
  const runFlush = async () => {
    const acquired = await redis.set(LOCK_KEY, "1", { NX: true, EX: LOCK_TTL_S });
    if (!acquired) return;

    try {
      const result = await flushTrackingEvents(redis);
      if (result.flushed > 0 || result.errors > 0) {
        console.log(
          `[TrackingEvents Flush] Flushed ${result.flushed} events, ${result.errors} errors`
        );
      }
    } catch (error) {
      console.error("[TrackingEvents Flush] Error:", error);
    } finally {
      await redis.del(LOCK_KEY);
    }
  };

  setInterval(runFlush, FLUSH_INTERVAL_MS);
  setTimeout(runFlush, STARTUP_DELAY_MS);
};
