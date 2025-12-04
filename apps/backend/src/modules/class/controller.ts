import { createHash } from "crypto";

import {
  ClassModel,
  IClassItem,
  ISectionItem,
  SectionModel,
} from "@repo/common";
import type { Request } from "express";
import type { RedisClientType } from "redis";

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

export const trackClassView = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string,
  req: Request,
  redis: RedisClientType
) => {
  const clientIp = req.ip || req.socket?.remoteAddress || "unknown";
  const userSessionId = req.sessionID || clientIp;
  const userAgent = req.get("user-agent") || "unknown";
  const classId = `${year}:${semester}:${sessionId}:${subject}:${courseNumber}:${number}`;

  const fingerprint = createHash("sha256")
    .update(`${userSessionId}:${userAgent}:${classId}`)
    .digest("hex");

  const dedupeKey = `view-dedupe:${fingerprint}`;

  const exists = await redis.exists(dedupeKey);
  if (exists) {
    console.log(`[ViewCount] Deduplicated view for ${classId}`);
    return true;
  }

  await redis.set(dedupeKey, "1", { EX: DEDUPE_TTL_SECONDS });

  const result = await ClassModel.updateOne(
    {
      year,
      semester,
      sessionId: sessionId ? sessionId : "1",
      subject,
      courseNumber,
      number,
    },
    { $inc: { viewCount: 1 } }
  );

  console.log(`[ViewCount] Incremented view for ${classId}, fingerprint: ${fingerprint.slice(0, 8)}...`);
  return result.modifiedCount > 0;
};
