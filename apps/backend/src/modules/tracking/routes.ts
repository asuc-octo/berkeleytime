import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { TrackingEventInput, bufferTrackingEvents } from "./controller";

export default (app: Application, redis: RedisClientType) => {
  app.post("/tracking/beacon", async (req: Request, res: Response) => {
    const body = req.body as { events?: TrackingEventInput[] };
    const events = body?.events;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).end();
    }

    if (events.length > 50) {
      return res.status(400).end();
    }

    try {
      await bufferTrackingEvents(redis, req, events);
    } catch {
      // Drop silently — sendBeacon callers never retry
    }

    return res.status(204).end();
  });
};
