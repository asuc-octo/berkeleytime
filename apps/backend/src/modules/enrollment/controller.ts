import { NewEnrollmentHistoryModel } from "@repo/common/models";

import { Semester } from "../../generated-types/graphql";
import { buildSubjectQuery } from "../../utils/subject";
import { formatEnrollment } from "./formatter";

export const getEnrollment = async (
  year: number,
  semester: Semester,
  sessionId: string | null,
  subject: string,
  courseNumber: string,
  sectionNumber: string
) => {
  const subjectQuery = buildSubjectQuery(subject);

  const enrollment = await NewEnrollmentHistoryModel.findOne({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject: subjectQuery,
    courseNumber,
    sectionNumber,
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
