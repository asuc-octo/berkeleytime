import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { bufferTrackingEvents } from "./ingest";
import { InvalidTrackingBatch } from "./validation";

export default (app: Application, redis: RedisClientType) => {
  app.post("/tracking/beacon", async (req: Request, res: Response) => {
    const body = req.body as { events?: unknown };
    const events = body?.events;

    try {
      await bufferTrackingEvents(redis, req, events);
    } catch (error) {
      if (error instanceof InvalidTrackingBatch) return res.status(400).end();
      // Drop silently — sendBeacon callers never retry
    }

    return res.status(204).end();
  });
};
