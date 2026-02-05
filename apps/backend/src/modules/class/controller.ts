import { createHash } from "crypto";
import type { Request } from "express";
import type { RedisClientType } from "redis";

import {
  AdTargetModel,
  ClassModel,
  ClassViewCountModel,
  CourseModel,
  IClassItem,
  ISectionItem,
  SectionModel,
} from "@repo/common/models";

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
  const primarySection = await SectionModel.findOne({
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    number,
    primary: true,
  }).lean();

  const sectionId = primarySection?.sectionId;

  console.log(primarySection);

  const sections = await SectionModel.find({
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    associatedSectionIds: { $in: [sectionId] },
    primary: false, // filter out lectures
  }).lean();

  if (sections.length === 0) {
    // For some reason, Physics 7B encodes relationships in the associatedClass field instead of the associatedSectionIds field
    // Bio 1B and Chem 3A do it the other way around
    const sections2 = await SectionModel.find({
      year,
      semester,
      sessionId,
      subject,
      courseNumber,
      associatedClass: parseInt(number),
      primary: false, // filter out lectures
    }).lean();
    if (sections2.length > 0) {
      sections.push(...sections2);
    }
  }

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

  const viewDoc = await ClassViewCountModel.findOne({
    year,
    semester,
    sessionId: sessionId || "1",
    subject,
    courseNumber,
    number,
  }).lean();

  const mongoViews = viewDoc?.viewCount ?? 0;

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

  // Deduplicate keys - Redis SCAN may return duplicates during hash table resizing
  const uniqueKeys = [...new Set(keys)];

  if (uniqueKeys.length === 0) {
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
      upsert: boolean;
    };
  }> = [];

  // Track the count we read for each key to decrement later
  const keyCountMap = new Map<string, number>();

  for (const key of uniqueKeys) {
    const value = await redis.get(key);
    if (!value) continue;

    const count = parseInt(value, 10);
    if (isNaN(count) || count === 0) continue;

    const parts = key.replace("view-counter:", "").split(":");
    if (parts.length !== 6) continue;

    const [yearStr, semester, sessionId, subject, courseNumber, number] = parts;
    const year = parseInt(yearStr, 10);

    if (isNaN(year)) continue;

    keyCountMap.set(key, count);
    operations.push({
      updateOne: {
        filter: { year, semester, sessionId, subject, courseNumber, number },
        update: { $inc: { viewCount: count } },
        upsert: true,
      },
    });
  }

  if (operations.length === 0) {
    return { flushed: 0, errors: 0 };
  }

  try {
    const result = await ClassViewCountModel.bulkWrite(operations, {
      ordered: false,
    });

    // Decrement only the counts we flushed, preserving any new views added after our read
    for (const [key, count] of keyCountMap) {
      const remaining = await redis.decrBy(key, count);
      // Clean up keys that are now zero or negative
      if (remaining <= 0) {
        await redis.del(key);
      }
    }

    return { flushed: result.modifiedCount + result.upsertedCount, errors: 0 };
  } catch {
    return { flushed: 0, errors: operations.length };
  }
};

// create an in-memory cache for ad targets
type CachedAdTarget = {
  specificClassIds?: string[] | null;
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
};
let adTargetsCache: CachedAdTarget[] | null = null;
let adTargetsCacheExpiry = 0;
const AD_TARGETS_CACHE_TTL_MS = 60_000; // 1 minute

const getCachedAdTargets = async (): Promise<CachedAdTarget[]> => {
  if (adTargetsCache !== null && Date.now() < adTargetsCacheExpiry) {
    return adTargetsCache;
  }
  adTargetsCache = await AdTargetModel.find().lean();
  adTargetsCacheExpiry = Date.now() + AD_TARGETS_CACHE_TTL_MS;
  return adTargetsCache;
};

export const invalidateAdTargetsCache = () => {
  adTargetsCache = null;
};

export const getHasAd = async (
  subject: string,
  courseNumber: string
): Promise<boolean> => {
  const adTargets = await getCachedAdTargets();
  if (!adTargets.length) return false;

  const course = await CourseModel.findOne({
    subject,
    number: courseNumber,
  }).lean();

  const classIds = new Set<string>([
    `${subject} ${courseNumber}`,
    ...(course?.crossListing ?? []),
  ]);

  const courseSubjects = new Set([...classIds].map((id) => id.split(" ")[0]));

  const courseNumMatch = courseNumber.match(/(\d+)/);
  const courseNum = courseNumMatch ? parseInt(courseNumMatch[1], 10) : NaN;

  for (const at of adTargets) {
    if (at.specificClassIds?.some((id: string) => classIds.has(id))) {
      return true;
    }

    if (at.subjects?.length) {
      const matches = [...courseSubjects].some((s) => at.subjects?.includes(s));
      if (!matches) continue;
    }

    const min = at.minCourseNumber ? parseInt(at.minCourseNumber, 10) : NaN;
    const max = at.maxCourseNumber ? parseInt(at.maxCourseNumber, 10) : NaN;

    if (!isNaN(min) && (isNaN(courseNum) || courseNum < min)) continue;
    if (!isNaN(max) && (isNaN(courseNum) || courseNum > max)) continue;

    return true;
  }

  return false;
};
