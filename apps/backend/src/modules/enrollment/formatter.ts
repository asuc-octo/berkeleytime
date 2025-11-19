import { IEnrollmentHistoryItem } from "@repo/common";

import { EnrollmentModule } from "./generated-types/module-types";

type EnrollmentHistorySingular = IEnrollmentHistoryItem["history"][number];

const normalizeEnrollmentSingular = (singular: EnrollmentHistorySingular) => {
  const normalized = {
    ...singular,
    startTime: singular.startTime.toISOString(),
    endTime: singular.endTime.toISOString(),
    enrolledCount: singular.enrolledCount ?? 0,
    reservedCount: singular.reservedCount ?? 0,
    waitlistedCount: singular.waitlistedCount ?? 0,
    minEnroll: singular.minEnroll ?? null,
    maxEnroll: singular.maxEnroll ?? 0,
    maxWaitlist: singular.maxWaitlist ?? 0,
    openReserved: singular.openReserved ?? 0,
    seatReservationCount: singular.seatReservationCount ?? [],
  } as EnrollmentModule.EnrollmentSingular;

  return normalized;
};

export const formatEnrollment = (enrollment: IEnrollmentHistoryItem) => {
  const history = enrollment.history?.map(normalizeEnrollmentSingular) ?? [];

  const output = {
    ...enrollment,
    seatReservationTypes: enrollment.seatReservationTypes ?? [],
    history,

    latest: history.length > 0 ? history[history.length - 1] : null,
  } as EnrollmentModule.Enrollment;

  return output;
};
