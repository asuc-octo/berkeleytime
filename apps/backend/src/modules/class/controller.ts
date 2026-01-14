import { createHash } from "crypto";
import type { Request } from "express";
import type { RedisClientType } from "redis";

import {
  ClassModel,
  IClassItem,
  ISectionItem,
  SectionModel,
} from "@repo/common";

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
    sessionId,
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
    sessionId,
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
    sessionId,
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
    sessionId,
    subject,
    courseNumber,
    number,
  }).lean();

  if (!section) return null;

  return formatSection(section as ISectionItem);
};

const DEDUPE_TTL_SECONDS = 30 * 60;
const RATE_LIMIT_TTL_SECONDS = 60 * 60;
const RATE_LIMIT_MAX = 100;

const getViewCounterKey = (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string
) =>
  `view-counter:${year}:${semester}:${sessionId}:${subject}:${courseNumber}:${number}`;

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
  const count = await redis.incr(rateLimitKey);
  if (count === 1) {
    await redis.expire(rateLimitKey, RATE_LIMIT_TTL_SECONDS);
  }

  if (count > RATE_LIMIT_MAX) {
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
    return { success: true };
  }

  await redis.set(dedupeKey, "1", { EX: DEDUPE_TTL_SECONDS });

  const counterKey = getViewCounterKey(
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    number
  );
  await redis.incr(counterKey);

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
  const counterKey = getViewCounterKey(
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    number
  );

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

  const mongoViews =
    (_class as IClassItem & { viewCount?: number })?.viewCount ?? 0;

  return pendingViews + mongoViews;
};

export const flushViewCounts = async (
  redis: RedisClientType
): Promise<{ flushed: number; errors: number }> => {
  const keys: string[] = [];
  let cursor = "0";
  do {
    const result = await redis.scan(cursor, {
      MATCH: "view-counter:*",
      COUNT: 100,
    });
    cursor = String(result.cursor);
    keys.push(...result.keys);
  } while (cursor !== "0");

  if (keys.length === 0) {
    return { flushed: 0, errors: 0 };
  }

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

  for (const key of keys) {
    const value = await redis.get(key);
    if (!value) continue;

    const count = parseInt(value, 10);
    if (isNaN(count) || count === 0) continue;

    const parts = key.replace("view-counter:", "").split(":");
    if (parts.length !== 6) continue;

    const [yearStr, semester, sessionId, subject, courseNumber, number] = parts;
    const year = parseInt(yearStr, 10);

    if (isNaN(year)) continue;

    operations.push({
      updateOne: {
        filter: { year, semester, sessionId, subject, courseNumber, number },
        update: { $inc: { viewCount: count } },
      },
    });
  }

  if (operations.length === 0) {
    return { flushed: 0, errors: 0 };
  }

  try {
    const result = await ClassModel.bulkWrite(operations, { ordered: false });

    // Delete Redis keys only after successful Mongo write
    for (const key of keys) {
      await redis.del(key);
    }

    return { flushed: result.modifiedCount, errors: 0 };
  } catch {
    return { flushed: 0, errors: operations.length };
  }
};
