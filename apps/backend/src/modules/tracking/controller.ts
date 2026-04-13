import { createHash } from "crypto";
import type { Request } from "express";
import type { RedisClientType } from "redis";

import { TrackingEventModel } from "@repo/common/models";

import { getClientIP } from "../../utils/ip";

const REDIS_BUFFER_KEY = "tracking-events-buffer";
const MAX_BATCH_SIZE = 50;

export interface TrackingEventInput {
  eventType: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface BufferedTrackingEvent extends TrackingEventInput {
  sessionId: string;
  userId?: string;
  ipHash: string;
  userAgent?: string;
  referrer?: string;
}

const hashIP = (ip: string): string => {
  return createHash("sha256").update(ip).digest("hex");
};

export const bufferTrackingEvents = async (
  redis: RedisClientType,
  req: Request,
  events: TrackingEventInput[]
): Promise<void> => {
  if (events.length > MAX_BATCH_SIZE) {
    throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE}`);
  }

  const ip = getClientIP(req);
  const ipHash = hashIP(ip);
  const userAgent = (req.get("user-agent") || "").slice(0, 500) || undefined;
  const referrer = req.get("referer") || req.get("referrer") || undefined;
  const sessionId = req.sessionID || "anonymous";
  const userId = (req.user as { _id?: string } | undefined)?._id;

  const buffered: BufferedTrackingEvent[] = events.map((event) => ({
    ...event,
    sessionId,
    userId,
    ipHash,
    userAgent,
    referrer,
  }));

  // Push all events to a single Redis list
  await redis.rPush(
    REDIS_BUFFER_KEY,
    buffered.map((e) => JSON.stringify(e))
  );
};

export const flushTrackingEvents = async (
  redis: RedisClientType
): Promise<{ flushed: number; errors: number }> => {
  const events = await redis.lRange(REDIS_BUFFER_KEY, 0, -1);

  if (events.length === 0) {
    return { flushed: 0, errors: 0 };
  }

  let flushed = 0;
  let errors = 0;

  try {
    const documents = events.map((eventJson) => {
      const event = JSON.parse(eventJson) as BufferedTrackingEvent;
      return {
        eventType: event.eventType,
        targetType: event.targetType,
        targetId: event.targetId,
        metadata: event.metadata,
        sessionId: event.sessionId,
        userId: event.userId,
        timestamp: new Date(event.timestamp),
        ipHash: event.ipHash,
        userAgent: event.userAgent,
        referrer: event.referrer,
      };
    });

    await TrackingEventModel.insertMany(documents, { ordered: false });

    // Remove only the processed events, preserving any new events added after lRange
    await redis.lTrim(REDIS_BUFFER_KEY, events.length, -1);

    flushed = documents.length;
  } catch (error) {
    console.error("[TrackingEvents Flush] Error:", error);
    errors++;
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
