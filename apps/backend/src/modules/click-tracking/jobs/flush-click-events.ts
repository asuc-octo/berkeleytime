import type { RedisClientType } from "redis";

import { flushClickEvents } from "../controller";

const FLUSH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const STARTUP_DELAY_MS = 60 * 1000; // 1 minute (staggered from other jobs)
let isRunning = false;

export const startClickEventsFlushJob = (redis: RedisClientType) => {
  const runFlush = async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      const result = await flushClickEvents(redis);
      if (result.flushed > 0 || result.errors > 0) {
        console.log(
          `[ClickEvents Flush] Flushed ${result.flushed} events, ${result.errors} errors`
        );
      }
    } catch (error) {
      console.error("[ClickEvents Flush] Error:", error);
    } finally {
      isRunning = false;
    }
  };

  setInterval(runFlush, FLUSH_INTERVAL_MS);
  setTimeout(runFlush, STARTUP_DELAY_MS);
};
