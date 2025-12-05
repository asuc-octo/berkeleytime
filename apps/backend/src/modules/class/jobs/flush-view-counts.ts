import type { RedisClientType } from "redis";

import { flushViewCounts } from "../controller";

const FLUSH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
let isRunning = false;

export const startViewCountFlushJob = (redis: RedisClientType) => {
  console.log("[ViewCount Flush Job] Starting scheduled job (every 10 minutes)");

  const runFlush = async () => {
    if (isRunning) {
      console.log("[ViewCount Flush Job] Previous flush still running, skipping");
      return;
    }

    isRunning = true;
    const startTime = Date.now();

    try {
      console.log(`[ViewCount Flush Job] Starting flush at ${new Date().toISOString()}`);
      const result = await flushViewCounts(redis);
      const duration = Date.now() - startTime;
      console.log(`[ViewCount Flush Job] Completed in ${duration}ms - flushed: ${result.flushed}, errors: ${result.errors}`);
    } catch (error) {
      console.error("[ViewCount Flush Job] Error:", error);
    } finally {
      isRunning = false;
    }
  };

  setInterval(runFlush, FLUSH_INTERVAL_MS);

  runFlush();
};

