import { NewEnrollmentHistoryModel } from "@repo/common";

import { EnrollmentModule } from "./generated-types/module-types";

export const getEnrollment = async (
  year: number,
  semester: string,
  sessionId: string | null,
  subject: string,
  courseNumber: string,
  sectionNumber: string
) => {
  const enrollment = await NewEnrollmentHistoryModel.findOne({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
    sectionNumber,
  }).lean();

  if (!enrollment) return null;

  return enrollment as EnrollmentModule.Enrollment;
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

  return enrollment as EnrollmentModule.Enrollment;
};
