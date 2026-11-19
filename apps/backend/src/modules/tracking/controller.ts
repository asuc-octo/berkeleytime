import type { RedisClientType } from "redis";

import { TrackingEventModel } from "@repo/common/models";

import {
  trackingFlushFailureCount,
  trackingQueueDepth,
} from "../../lib/metrics";
import { TRACKING_QUEUE_KEYS, warnTrackingFailure } from "./ingest";
import {
  MAX_EVENT_BYTES,
  OUTREACH_TARGETS,
  parseClientTimestamp,
  validateTrackingBatch,
} from "./validation";

const FLUSH_CHUNK_SIZE = 500;

export const flushTrackingEvents = async (
  redis: RedisClientType
): Promise<{ flushed: number; errors: number }> => {
  let flushed = 0;
  let errors = 0;

  // Drain both bounded queues; also drain pre-deployment records as unknown.
  for (const queue of [
    ...Object.values(TRACKING_QUEUE_KEYS),
    "tracking-events-buffer",
  ]) {
    while (true) {
      const raw = await redis.lRange(queue, 0, FLUSH_CHUNK_SIZE - 1);
      if (raw.length === 0) break;

      // Discard malformed records individually so valid records can flush.
      const documents: object[] = [];
      for (const json of raw) {
        try {
          if (Buffer.byteLength(json) > MAX_EVENT_BYTES)
            throw new Error("Oversized buffered event");
          const event = JSON.parse(json);
          const [validated] = validateTrackingBatch([event]);
          const timestamp = parseClientTimestamp(validated.timestamp);
          if (
            !timestamp ||
            typeof event.sessionId !== "string" ||
            !event.sessionId ||
            event.sessionId.length > 128 ||
            typeof event.ipHash !== "string" ||
            !/^[a-f0-9]{64}$/.test(event.ipHash) ||
            (event.userId != null &&
              (typeof event.userId !== "string" ||
                event.userId.length > 128)) ||
            (event.userAgent != null &&
              (typeof event.userAgent !== "string" ||
                event.userAgent.length > 500)) ||
            (event.referrer != null &&
              (typeof event.referrer !== "string" ||
                event.referrer.length > 512)) ||
            (event.source != null &&
              event.source !== "client" &&
              event.source !== "server-redirect")
          ) {
            throw new Error("Malformed buffered event");
          }
          documents.push({
            ...validated,
            sessionId: event.sessionId,
            userId: event.userId,
            timestamp: new Date(timestamp),
            clientTimestamp:
              typeof event.clientTimestamp === "string" &&
              parseClientTimestamp(event.clientTimestamp)
                ? new Date(event.clientTimestamp)
                : undefined,
            source: event.source,
            ipHash: event.ipHash,
            userAgent: event.userAgent,
            referrer: event.referrer,
          });
        } catch {
          warnTrackingFailure("discarding malformed buffered event");
          trackingFlushFailureCount.add(1, { reason: "malformed" });
          errors++;
        }
      }

      if (documents.length > 0) {
        try {
          await TrackingEventModel.insertMany(documents, { ordered: false });
          flushed += documents.length;
          await redis.lTrim(queue, raw.length, -1);
        } catch {
          warnTrackingFailure("Mongo insert failed");
          trackingFlushFailureCount.add(1, { reason: "mongo" });
          errors++;
          break;
        }
      } else {
        await redis.lTrim(queue, raw.length, -1);
      }

      if (raw.length < FLUSH_CHUNK_SIZE) break;
    }
    trackingQueueDepth.record(await redis.lLen(queue), { source: queue });
  }

  return { flushed, errors };
};

export interface TrackingEventTimeSeriesPoint {
  date: string;
  count: number;
}

export const getTrackingEventsTimeSeries = async (
  eventType?: string,
  targetType?: string,
  targetId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<TrackingEventTimeSeriesPoint[]> => {
  const match: Record<string, unknown> = {};

  if (eventType) match.eventType = eventType;
  if (targetType) match.targetType = targetType;
  if (targetId) match.targetId = targetId;

  // Protect every query shape, including click queries without a target filter.
  // Client and historical outreach claims never become server-observed counts.
  match.$nor = [
    {
      eventType: "click",
      targetType: { $in: [...OUTREACH_TARGETS] },
      source: { $ne: "server-redirect" },
    },
  ];

  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) {
      (match.timestamp as Record<string, Date>).$gte = startDate;
    }
    if (endDate) {
      (match.timestamp as Record<string, Date>).$lte = endDate;
    }
  }

  const results = await TrackingEventModel.aggregate<{
    _id: string;
    count: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({ date: r._id, count: r.count }));
};
