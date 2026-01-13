import { IEnrollmentHistoryItem } from "@repo/common";

import { EnrollmentModule } from "./generated-types/module-types";

type EnrollmentHistorySingular = IEnrollmentHistoryItem["history"][number];

const normalizeEnrollmentSingular = (
  singular: EnrollmentHistorySingular,
  seatReservationTypes: IEnrollmentHistoryItem["seatReservationTypes"]
) => {
  const types = seatReservationTypes ?? [];
  const counts = singular.seatReservationCount ?? [];
  const now = new Date();

  // Join seatReservationCount with seatReservationTypes by number
  const enrichedSeatReservationCount = counts.map((count) => {
    const matchingType = types.find((type) => type.number === count.number);
    const maxEnroll = count.maxEnroll ?? 0;
    const fromDate = matchingType?.fromDate ?? "";
    const fromDateObj = fromDate ? new Date(fromDate) : null;

    // Validation logic: maxEnroll > 1 AND reservation period has started
    const isValid = maxEnroll > 1 && (!fromDateObj || fromDateObj <= now);

    return {
      ...count,
      requirementGroup: {
        code: matchingType?.requirementGroup?.code ?? null,
        description: matchingType?.requirementGroup?.description ?? "Unknown",
      },
      fromDate,
      isValid,
    };
  });

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
    seatReservationCount: enrichedSeatReservationCount,
  } as EnrollmentModule.EnrollmentSingular;

  return normalized;
};

export const formatEnrollment = (enrollment: IEnrollmentHistoryItem) => {
  const seatReservationTypes = enrollment.seatReservationTypes ?? [];
  const history =
    enrollment.history?.map((singular) =>
      normalizeEnrollmentSingular(singular, seatReservationTypes)
    ) ?? [];

  const output = {
    ...enrollment,
    seatReservationTypes: [], // No longer expose this at the API level
    history,

    latest: history.length > 0 ? history[history.length - 1] : null,
  } as EnrollmentModule.Enrollment;

  return output;
};
