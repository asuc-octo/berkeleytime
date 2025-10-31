import { NewEnrollmentHistoryModel, SectionModel } from "@repo/common";

import { Semester } from "../../generated-types/graphql";
import { formatEnrollment } from "./formatter";

export const getEnrollment = async (
  year: number,
  semester: Semester,
  sessionId: string | null,
  subject: string,
  courseNumber: string,
  sectionNumber: string
) => {
  // First find the section to get sectionId (handles cross-listed courses)
  const section = await SectionModel.findOne({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
    number: sectionNumber,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  if (!section) return null;

  // Query by sectionId instead of subject+courseNumber
  const enrollment = await NewEnrollmentHistoryModel.findOne({
    sectionId: section.sectionId,
  }).lean();

  if (!enrollment) return null;

  return formatEnrollment(enrollment);
};

export const getEnrollmentBySectionId = async (
  termId: string,
  sessionId: string,
  sectionId: string
) => {
  const enrollment = await NewEnrollmentHistoryModel.findOne({
    termId,
    sessionId,
    sectionId,
  }).lean();

  if (!enrollment) return null;

  return formatEnrollment(enrollment);
};
