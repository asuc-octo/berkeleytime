import { createHash } from "crypto";
import type { Request } from "express";
import type { RedisClientType } from "redis";

import { TrackingEventModel } from "@repo/common/models";

import { getClientIP } from "../../utils/ip";

const REDIS_BUFFER_KEY = "tracking-events-buffer";
const MAX_BATCH_SIZE = 50;
const MAX_BUFFER_SIZE = 100_000;

// Rate limiting: max 30 calls per IP per minute
const RATE_LIMIT_WINDOW_S = 60;
const RATE_LIMIT_MAX_CALLS = 30;

// Per-event field limits
const MAX_STRING_FIELD_LEN = 128;
const MAX_METADATA_BYTES = 1_024;
const MAX_METADATA_KEYS = 20;
const MAX_METADATA_DEPTH = 2;

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

// Allow alphanumeric, underscore, hyphen, dot, colon, slash — covers all real event/target type values
const sanitizeToken = (s: string, maxLen: number): string =>
  s.replace(/[^\w\-.:/]/g, "").slice(0, maxLen);

const sanitizeMetadata = (
  obj: Record<string, unknown>,
  depth = 0
): Record<string, unknown> => {
  if (depth >= MAX_METADATA_DEPTH) return {};
  const result: Record<string, unknown> = {};
  let keyCount = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (keyCount >= MAX_METADATA_KEYS) break;
    // Strip MongoDB operator prefix ($) and dot notation to prevent query injection
    const safeKey = k.replace(/[$.]/g, "_").slice(0, 64);
    if (typeof v === "string") {
      result[safeKey] = v.slice(0, 256);
    } else if (typeof v === "number" || typeof v === "boolean" || v === null) {
      result[safeKey] = v;
    } else if (typeof v === "object" && !Array.isArray(v) && v !== null) {
      result[safeKey] = sanitizeMetadata(
        v as Record<string, unknown>,
        depth + 1
      );
    } else {
      result[safeKey] = String(v).slice(0, 256);
    }
    keyCount++;
  }
  return result;
};

const sanitizeEvent = (event: TrackingEventInput): TrackingEventInput => {
  const sanitized: TrackingEventInput = {
    eventType: sanitizeToken(event.eventType, MAX_STRING_FIELD_LEN),
    targetType: sanitizeToken(event.targetType, MAX_STRING_FIELD_LEN),
    targetId: event.targetId
      ? sanitizeToken(event.targetId, MAX_STRING_FIELD_LEN)
      : undefined,
    timestamp: event.timestamp,
    metadata: undefined,
  };

  if (event.metadata) {
    const sanitizedMeta = sanitizeMetadata(event.metadata);
    if (JSON.stringify(sanitizedMeta).length <= MAX_METADATA_BYTES) {
      sanitized.metadata = sanitizedMeta;
    }
    // Metadata exceeding 1KB after sanitization is dropped entirely
  }

  return sanitized;
};

export const bufferTrackingEvents = async (
  redis: RedisClientType,
  req: Request,
  events: TrackingEventInput[]
): Promise<void> => {
  if (events.length > MAX_BATCH_SIZE) {
    throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE}`);
  }

  const currentLen = await redis.lLen(REDIS_BUFFER_KEY);
  if (currentLen >= MAX_BUFFER_SIZE) {
    console.warn(
      `[TrackingEvents] Buffer at capacity (${currentLen}), dropping batch of ${events.length}`
    );
    return;
  }

  const ip = getClientIP(req);
  const ipHash = hashIP(ip);

  const rateLimitKey = `tracking:ratelimit:${ipHash}`;
  const callCount = await redis.incr(rateLimitKey);
  if (callCount === 1) await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW_S);
  if (callCount > RATE_LIMIT_MAX_CALLS) return;

  const userAgent = (req.get("user-agent") || "").slice(0, 500) || undefined;
  const referrer = req.get("referer") || req.get("referrer") || undefined;
  const sessionId = req.sessionID || "anonymous";
  const userId = (req.user as { _id?: string } | undefined)?._id;

  const buffered: BufferedTrackingEvent[] = events.map((event) => ({
    ...sanitizeEvent(event),
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

const FLUSH_CHUNK_SIZE = 500;

export const flushTrackingEvents = async (
  redis: RedisClientType
): Promise<{ flushed: number; errors: number }> => {
  let flushed = 0;
  let errors = 0;

  while (true) {
    const raw = await redis.lRange(REDIS_BUFFER_KEY, 0, FLUSH_CHUNK_SIZE - 1);
    if (raw.length === 0) break;

    // Parse individually — one malformed entry discarded, not blocking entire chunk
    const documents: object[] = [];
    for (const json of raw) {
      try {
        const event = JSON.parse(json) as BufferedTrackingEvent;
        documents.push({
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
        });
      } catch {
        console.warn("[TrackingEvents Flush] Discarding malformed event");
        errors++;
      }
    }

    if (documents.length > 0) {
      try {
        await TrackingEventModel.insertMany(documents, { ordered: false });
        flushed += documents.length;
        await redis.lTrim(REDIS_BUFFER_KEY, raw.length, -1);
      } catch (error) {
        console.error("[TrackingEvents Flush] insertMany error:", error);
        errors++;
        break;
      }
    } else {
      await redis.lTrim(REDIS_BUFFER_KEY, raw.length, -1);
    }

    if (raw.length < FLUSH_CHUNK_SIZE) break;
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
