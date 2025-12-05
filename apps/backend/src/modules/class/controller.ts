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
