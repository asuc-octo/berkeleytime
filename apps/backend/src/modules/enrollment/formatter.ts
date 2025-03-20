import { IEnrollmentHistoryItem } from "@repo/common";

import { EnrollmentModule } from "./generated-types/module-types";

export const formatEnrollment = (enrollment: IEnrollmentHistoryItem) => {
  const output = {
    ...enrollment,

    latest:
      enrollment.history.length > 0
        ? enrollment.history[enrollment.history.length - 1]
        : null,
  } as EnrollmentModule.Enrollment;

  return output;
};
