import type { RedisClientType } from "redis";

import { flushBannerViewCounts } from "../controller";

const FLUSH_INTERVAL_MS = 10 * 60 * 1000;
const STARTUP_DELAY_MS = 45 * 1000; // Staggered from class job (30s)
let isRunning = false;

export const startBannerViewCountFlushJob = (redis: RedisClientType) => {
  const runFlush = async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      await flushBannerViewCounts(redis);
    } finally {
      isRunning = false;
    }
  };

  setInterval(runFlush, FLUSH_INTERVAL_MS);
  setTimeout(runFlush, STARTUP_DELAY_MS);
};
