import { NewEnrollmentHistoryModel } from "@repo/common";

import { EnrollmentModule } from "./generated-types/module-types";

export const getEnrollment = async (
  termId: string,
  sessionId: string,
  sectionId: string
) => {
  const enrollment = await NewEnrollmentHistoryModel.findOne({
    termId,
    sessionId,
    sectionId,
  })
    .select("-_id -__v")
    .lean();

  return enrollment as EnrollmentModule.Enrollment;
};
