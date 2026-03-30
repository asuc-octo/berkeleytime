import type { RedisClientType } from "redis";

import { flushTrackingEvents } from "../controller";

const FLUSH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const STARTUP_DELAY_MS = 90 * 1000; // 1.5 minutes (staggered from other jobs)
let isRunning = false;

export const startTrackingEventsFlushJob = (redis: RedisClientType) => {
  const runFlush = async () => {
    if (isRunning) return;

    isRunning = true;

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
      isRunning = false;
    }
  };

  setInterval(runFlush, FLUSH_INTERVAL_MS);
  setTimeout(runFlush, STARTUP_DELAY_MS);
};
