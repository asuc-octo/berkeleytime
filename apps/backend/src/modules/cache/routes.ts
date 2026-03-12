import { type Application, type Request, type Response } from "express";
import { RedisClientType } from "redis";

import { flushViewCounts } from "../class/controller";

export default (app: Application, redis: RedisClientType) => {
  app.post(
    "/cache/flush-view-counts",
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const result = await flushViewCounts(redis);
        res.status(200).json(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("[Cache API] Flush error:", error);
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
        });
      }
    }
  );
};
