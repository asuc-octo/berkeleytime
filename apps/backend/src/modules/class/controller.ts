import {
  ClassModel,
  IClassItem,
  ISectionItem,
  SectionModel,
} from "@repo/common";

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

  console.log(await ClassModel.countDocuments({}));

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
