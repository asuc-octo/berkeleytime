import { ClassModel, SectionModel } from "@repo/common";

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

  return formatClass(_class);
};

export const getSecondarySections = async (
  year: number,
  semester: string,
  subject: string,
  courseNumber: string,
  classNumber: string
) => {
  return await SectionModel.find({
    "class.course.subjectArea.code": subject,
    "class.course.catalogNumber.formatted": courseNumber,
    "class.session.term.name": `${year} ${semester}`,
    "class.number": classNumber,
    "association.primary": false,
  })
    .lean()
    .then((sections) => sections.map(formatSection));
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
    "association.primary": true,
  }).lean();

  if (!section) return null;

  return formatSection(section);
};

export const getSection = async (
  year: number,
  semester: string,
  subject: string,
  courseNumber: string,
  classNumber: string,
  sectionNumber: string
) => {
  const section = await SectionModel.findOne({
    "class.course.subjectArea.code": subject,
    "class.course.catalogNumber.formatted": courseNumber,
    "class.session.term.name": `${year} ${semester}`,
    "class.number": classNumber,
    number: sectionNumber,
  }).lean();

  if (!section) return null;

  return formatSection(section);
};
