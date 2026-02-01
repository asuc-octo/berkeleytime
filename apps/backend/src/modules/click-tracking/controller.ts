import { createHash } from "crypto";
import type { Request } from "express";
import type { RedisClientType } from "redis";

import {
  BannerModel,
  ClickEventModel,
  RouteRedirectModel,
} from "@repo/common/models";

import { getClientIP } from "../../utils/ip";

export type TargetType = "banner" | "redirect";

export interface ClickEventData {
  targetId: string;
  targetType: TargetType;
  timestamp: string;
  ipHash: string;
  userAgent?: string;
  referrer?: string;
  sessionFingerprint: string;
}

const getClickEventsBufferKey = (targetType: TargetType, targetId: string) =>
  `click-events-buffer:${targetType}:${targetId}`;

export const hashIP = (ip: string): string => {
  return createHash("sha256").update(ip).digest("hex");
};

export const generateSessionFingerprint = (
  ip: string,
  userAgent: string,
  targetId: string
): string => {
  return createHash("sha256")
    .update(`${ip}:${userAgent}:${targetId}`)
    .digest("hex");
};

export const extractClickMetadata = (
  req: Request,
  targetId: string,
  targetType: TargetType
): ClickEventData => {
  const ip = getClientIP(req);
  const userAgent = (req.get("user-agent") || "").slice(0, 500);
  const referrer = req.get("referer") || req.get("referrer") || undefined;

  return {
    targetId,
    targetType,
    timestamp: new Date().toISOString(),
    ipHash: hashIP(ip),
    userAgent: userAgent || undefined,
    referrer,
    sessionFingerprint: generateSessionFingerprint(ip, userAgent, targetId),
  };
};

export const bufferClickEvent = async (
  redis: RedisClientType,
  eventData: ClickEventData
): Promise<void> => {
  const key = getClickEventsBufferKey(eventData.targetType, eventData.targetId);
  await redis.rPush(key, JSON.stringify(eventData));
};

export const trackIntensiveClick = async (
  redis: RedisClientType,
  req: Request,
  targetId: string,
  targetType: TargetType
): Promise<void> => {
  const eventData = extractClickMetadata(req, targetId, targetType);
  await bufferClickEvent(redis, eventData);
};

export const flushClickEvents = async (
  redis: RedisClientType
): Promise<{ flushed: number; errors: number }> => {
  // Scan for all click-events-buffer keys
  const keys: string[] = [];
  let cursor = "0";
  do {
    const result = await redis.scan(cursor, {
      MATCH: "click-events-buffer:*",
      COUNT: 100,
    });
    cursor = String(result.cursor);
    keys.push(...result.keys);
  } while (cursor !== "0");

  // Deduplicate keys - Redis SCAN may return duplicates during hash table resizing
  const uniqueKeys = [...new Set(keys)];

  if (uniqueKeys.length === 0) {
    return { flushed: 0, errors: 0 };
  }

  let flushed = 0;
  let errors = 0;

  for (const key of uniqueKeys) {
    try {
      // Get all events from the list
      const events = await redis.lRange(key, 0, -1);
      if (events.length === 0) continue;

      // Parse and prepare for bulk insert
      const documents = events.map((eventJson) => {
        const event: ClickEventData = JSON.parse(eventJson);
        return {
          targetId: event.targetId,
          targetType: event.targetType,
          timestamp: new Date(event.timestamp),
          ipHash: event.ipHash,
          userAgent: event.userAgent,
          referrer: event.referrer,
          sessionFingerprint: event.sessionFingerprint,
        };
      });

      // Bulk insert to MongoDB
      await ClickEventModel.insertMany(documents, { ordered: false });

      // Remove only the processed events, preserving any new events added after lRange
      // lTrim keeps elements from index `events.length` to the end (-1)
      await redis.lTrim(key, events.length, -1);

      flushed += documents.length;
    } catch (error) {
      console.error(`Error flushing click events for key ${key}:`, error);
      errors++;
    }
  }

  return { flushed, errors };
};

export const getClickEvents = async (
  targetId: string,
  targetType: TargetType,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100,
  offset: number = 0
) => {
  const query: Record<string, unknown> = { targetId, targetType };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      (query.timestamp as Record<string, Date>).$gte = startDate;
    }
    if (endDate) {
      (query.timestamp as Record<string, Date>).$lte = endDate;
    }
  }

  const [events, totalCount] = await Promise.all([
    ClickEventModel.find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    ClickEventModel.countDocuments(query),
  ]);

  return {
    events,
    totalCount,
    hasMore: offset + events.length < totalCount,
  };
};

export const getClickStats = async (
  targetId: string,
  targetType: TargetType,
  startDate?: Date,
  endDate?: Date
) => {
  const query: Record<string, unknown> = { targetId, targetType };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      (query.timestamp as Record<string, Date>).$gte = startDate;
    }
    if (endDate) {
      (query.timestamp as Record<string, Date>).$lte = endDate;
    }
  }

  const [totalClicks, uniqueVisitors] = await Promise.all([
    ClickEventModel.countDocuments(query),
    ClickEventModel.distinct("sessionFingerprint", query).then(
      (arr) => arr.length
    ),
  ]);

  return {
    totalClicks,
    uniqueVisitors,
  };
};

export const checkClickEventLoggingEnabled = async (
  targetId: string,
  targetType: TargetType
): Promise<boolean> => {
  if (targetType === "banner") {
    const banner = await BannerModel.findById(targetId).lean();
    return banner?.clickEventLogging === true;
  } else {
    const redirect = await RouteRedirectModel.findById(targetId).lean();
    return redirect?.clickEventLogging === true;
  }
};
