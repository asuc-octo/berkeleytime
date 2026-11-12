import {
  EnrollmentPullModel,
  NewEnrollmentHistoryModel,
} from "@repo/common/models";

import { Semester } from "../../generated-types/graphql";
import { buildSubjectQuery } from "../../utils/subject";
import { formatEnrollment } from "./formatter";

// lastPulledAt only changes when the datapuller runs (every 15 minutes)
const LAST_PULLED_AT_TTL = 60 * 1000; // 1 minute

const lastPulledAtCache = new Map<
  string,
  { lastPulledAt: Date | null; loadedAt: number }
>();

export const getLastPulledAt = async (termId: string) => {
  const cached = lastPulledAtCache.get(termId);
  if (cached && Date.now() - cached.loadedAt < LAST_PULLED_AT_TTL) {
    return cached.lastPulledAt;
  }

  const pull = await EnrollmentPullModel.findOne({ termId }).lean();
  const lastPulledAt = pull?.lastPulledAt ?? null;
  lastPulledAtCache.set(termId, { lastPulledAt, loadedAt: Date.now() });

  return lastPulledAt;
};

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

  return formatEnrollment(enrollment, await getLastPulledAt(enrollment.termId));
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

  return formatEnrollment(enrollment, await getLastPulledAt(termId));
};
