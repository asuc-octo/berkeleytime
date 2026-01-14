import type { RedisClientType } from "redis";

import { flushViewCounts } from "../controller";

const FLUSH_INTERVAL_MS = 10 * 60 * 1000;
const STARTUP_DELAY_MS = 30 * 1000;
let isRunning = false;

export const startViewCountFlushJob = (redis: RedisClientType) => {
  const runFlush = async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      await flushViewCounts(redis);
    } finally {
      isRunning = false;
    }
  };

  setInterval(runFlush, FLUSH_INTERVAL_MS);
  setTimeout(runFlush, STARTUP_DELAY_MS);
};
