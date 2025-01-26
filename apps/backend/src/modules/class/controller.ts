import { ClassModel, ClassType, SectionModel, SectionType } from "@repo/common";

import { formatClass, formatSection } from "./formatter";

export const getClass = async (
  year: number,
  semester: string,
  subject: string,
  courseNumber: string,
  classNumber: string
) => {
  const _class = await ClassModel.findOne({
    "course.subjectArea.code": subject,
    "course.catalogNumber.formatted": courseNumber,
    "session.term.name": `${year} ${semester}`,
    number: classNumber,
  }).lean();

  if (!_class) return null;

  return formatClass(_class as ClassType);
};

export const getSecondarySections = async (
  year: number,
  semester: string,
  subject: string,
  courseNumber: string,
  number: string
) => {
  const sections = await SectionModel.find({
    "class.course.subjectArea.code": subject,
    "class.course.catalogNumber.formatted": courseNumber,
    "class.session.term.name": `${year} ${semester}`,
    "class.number": { $regex: `^(${number[number.length - 1]}|999)` },
  }).lean();

  return sections.map((section) => formatSection(section as SectionType));
};

export const getPrimarySection = async (
  year: number,
  semester: string,
  subject: string,
  courseNumber: string,
  classNumber: string
) => {
  const section = await SectionModel.findOne({
    "class.course.subjectArea.code": subject,
    "class.course.catalogNumber.formatted": courseNumber,
    "class.session.term.name": `${year} ${semester}`,
    "class.number": classNumber,
  }).lean();

  if (!section) return null;

  return formatSection(section as SectionType);
};

export const getSection = async (
  year: number,
  semester: string,
  subject: string,
  courseNumber: string,
  number: string
) => {
  const section = await SectionModel.findOne({
    "class.course.subjectArea.code": subject,
    "class.course.catalogNumber.formatted": courseNumber,
    "class.session.term.name": `${year} ${semester}`,
    number: number,
  }).lean();

  if (!section) return null;

  return formatSection(section as SectionType);
};
