import {
  ClassModel,
  DecalModel,
  IClassItem,
  ISectionItem,
  SectionModel,
} from "@repo/common";

import { formatClass, formatDecal, formatSection } from "./formatter";

/**
 * Get a class
 * @default sessionId "1"
 */
export const getClass = async ({
  sessionId = "1",
  ...options
}: {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  number: string;
}) => {
  const _class = await ClassModel.findOne({
    sessionId,
    ...options,
  }).lean();

  if (!_class) return null;

  return formatClass(_class as IClassItem);
};

/**
 * Get the secondary sections for a class
 * - Includes any 999 sections
 * - Includes any sections prefixed by the primary section
 * - Does not include the primary section
 * @default sessionId "1"
 */
export const getSecondarySections = async ({
  sessionId = "1",
  number,
  ...options
}: {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  number: string;
}) => {
  const sections = await SectionModel.find({
    ...options,
    sessionId,
    number: { $regex: `^(?:${number[number.length - 1]}\d\d|999)$` },
  }).lean();

  return sections.map((section) => formatSection(section as ISectionItem));
};

/**
 * Get the primary section for a class
 * @default sessionId "1"
 */
export const getPrimarySection = async ({
  sessionId = "1",
  ...options
}: {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  number: string;
}) => {
  const section = await SectionModel.findOne({
    ...options,
    sessionId,
    primary: true,
  }).lean();

  if (!section) return null;

  return formatSection(section as ISectionItem);
};

/**
 * Get a section
 * @default sessionId "1"
 */
export const getSection = async ({
  sessionId = "1",
  ...options
}: {
  year: number;
  semester: string;
  sessionId?: string;
  subject: string;
  courseNumber: string;
  number: string;
}) => {
  const section = await SectionModel.findOne({
    ...options,
    sessionId,
  }).lean();

  if (!section) return null;

  return formatSection(section as ISectionItem);
};

export const getDecal = async (options: {
  year: number;
  semester: string;
  subject: string;
  courseNumber: string;
  number: string;
}) => {
  const decal = await DecalModel.findOne(options).lean();

  if (!decal) return null;

  return formatDecal(decal);
};
