import { createHash } from "crypto";

import {
  ClassModel,
  IClassItem,
  ISectionItem,
  SectionModel,
} from "@repo/common";
import type { Request } from "express";
import type { RedisClientType } from "redis";

import { getClientIP } from "../../utils/ip";
import { formatClass, formatSection } from "./formatter";

export const getClass = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string
) => {
  const _class = await ClassModel.findOne({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
    number,
  }).lean();

  if (!_class) return null;

  return formatClass(_class as IClassItem);
};

export const getSecondarySections = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string
) => {
  const sections = await SectionModel.find({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
    number: { $regex: `^(${number[number.length - 1]}|999)` },
  }).lean();

  return sections.map((section) => formatSection(section as ISectionItem));
};

export const getPrimarySection = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string
) => {
  const section = await SectionModel.findOne({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
    number,
    primary: true,
  }).lean();

  if (!section) return null;

  return formatSection(section as ISectionItem);
};

export const getSection = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string
) => {
  const section = await SectionModel.findOne({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
    number,
  }).lean();

  if (!section) return null;

  return formatSection(section as ISectionItem);
};

const DEDUPE_TTL_SECONDS = 30 * 60; // 30 minutes
const RATE_LIMIT_TTL_SECONDS = 60 * 60; // 1 hour
const RATE_LIMIT_MAX = 100; // 100 views per hour per IP

const getViewCounterKey = (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string
) => `view-counter:${year}:${semester}:${sessionId}:${subject}:${courseNumber}:${number}`;

export const trackClassView = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string,
  req: Request,
  redis: RedisClientType
): Promise<{ success: boolean; rateLimited?: boolean }> => {
  const clientIp = getClientIP(req);
  const classId = `${year}:${semester}:${sessionId}:${subject}:${courseNumber}:${number}`;

  const rateLimitKey = `rate-limit:${clientIp}`;
  const currentCount = await redis.get(rateLimitKey);
  const count = currentCount ? parseInt(currentCount, 10) : 0;

  if (count >= RATE_LIMIT_MAX) {
    console.log(`[ViewCount] Rate limited IP ${clientIp}, count: ${count}`);
    return { success: false, rateLimited: true };
  }

  const userSessionId = req.sessionID || clientIp;
  const userAgent = req.get("user-agent") || "unknown";

  const fingerprint = createHash("sha256")
    .update(`${userSessionId}:${userAgent}:${classId}`)
    .digest("hex");

  const dedupeKey = `view-dedupe:${fingerprint}`;

  const exists = await redis.exists(dedupeKey);
  if (exists) {
    console.log(`[ViewCount] Deduplicated view for ${classId}`);
    return { success: true };
  }

  const newRateLimitCount = await redis.incr(rateLimitKey);
  if (newRateLimitCount === 1) {
    await redis.expire(rateLimitKey, RATE_LIMIT_TTL_SECONDS);
  }

  await redis.set(dedupeKey, "1", { EX: DEDUPE_TTL_SECONDS });

  const counterKey = getViewCounterKey(year, semester, sessionId, subject, courseNumber, number);
  const newCount = await redis.incr(counterKey);

  console.log(`[ViewCount] Incremented view for ${classId}, count: ${newCount}, IP: ${clientIp}`);
  return { success: true };
};

export const getViewCount = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string,
  redis: RedisClientType
): Promise<number> => {
  const counterKey = getViewCounterKey(year, semester, sessionId, subject, courseNumber, number);

  const redisCount = await redis.get(counterKey);
  const pendingViews = redisCount ? parseInt(redisCount, 10) : 0;

  const _class = await ClassModel.findOne({
    year,
    semester,
    sessionId: sessionId || "1",
    subject,
    courseNumber,
    number,
  }).lean();

  const mongoViews = (_class as IClassItem & { viewCount?: number })?.viewCount ?? 0;

  return pendingViews + mongoViews;
};

export const flushViewCounts = async (
  redis: RedisClientType
): Promise<{ flushed: number; errors: number }> => {
  console.log("[ViewCount Flush] Starting flush...");

  const keys = await redis.keys("view-counter:*");

  if (keys.length === 0) {
    console.log("[ViewCount Flush] No counters to flush");
    return { flushed: 0, errors: 0 };
  }

  console.log(`[ViewCount Flush] Found ${keys.length} counters`);

  const operations: Array<{
    updateOne: {
      filter: {
        year: number;
        semester: string;
        sessionId: string;
        subject: string;
        courseNumber: string;
        number: string;
      };
      update: { $inc: { viewCount: number } };
    };
  }> = [];

  const keysToDelete: string[] = [];

  for (const key of keys) {
    const value = await redis.get(key);
    if (!value) continue;

    const count = parseInt(value, 10);
    if (isNaN(count) || count === 0) continue;

    const parts = key.replace("view-counter:", "").split(":");
    if (parts.length !== 6) {
      console.log(`[ViewCount Flush] Invalid key format: ${key}`);
      continue;
    }

    const [yearStr, semester, sessionId, subject, courseNumber, number] = parts;
    const year = parseInt(yearStr, 10);

    if (isNaN(year)) {
      console.log(`[ViewCount Flush] Invalid year in key: ${key}`);
      continue;
    }

    operations.push({
      updateOne: {
        filter: { year, semester, sessionId, subject, courseNumber, number },
        update: { $inc: { viewCount: count } },
      },
    });

    keysToDelete.push(key);
  }

  if (operations.length === 0) {
    console.log("[ViewCount Flush] No valid operations to execute");
    return { flushed: 0, errors: 0 };
  }

  try {
    const result = await ClassModel.bulkWrite(operations, { ordered: false });
    console.log(`[ViewCount Flush] Updated ${result.modifiedCount} documents`);

    for (const key of keysToDelete) {
      await redis.del(key);
    }
    console.log(`[ViewCount Flush] Deleted ${keysToDelete.length} Redis keys`);

    return { flushed: result.modifiedCount, errors: 0 };
  } catch (error) {
    console.error("[ViewCount Flush] Error during bulk write:", error);
    return { flushed: 0, errors: operations.length };
  }
};
