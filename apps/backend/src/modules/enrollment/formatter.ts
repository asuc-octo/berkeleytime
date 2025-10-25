import { IEnrollmentHistoryItem } from "@repo/common";

import { EnrollmentModule } from "./generated-types/module-types";

type EnrollmentHistorySingular = IEnrollmentHistoryItem["history"][number];
const normalizeSeatReservationCounts = (
  counts: EnrollmentHistorySingular["seatReservationCount"]
) => {
  if (!counts) return [];

  return counts.map(
    (reservation) =>
      ({
        number: reservation.number ?? 0,
        maxEnroll: reservation.maxEnroll ?? 0,
        enrolledCount: reservation.enrolledCount ?? 0,
      }) as EnrollmentModule.SeatReservationCounts
  );
};

const normalizeEnrollmentSingular = (singular: EnrollmentHistorySingular) => {
  const normalized = {
    ...singular,
    enrolledCount: singular.enrolledCount ?? 0,
    reservedCount: singular.reservedCount ?? 0,
    waitlistedCount: singular.waitlistedCount ?? 0,
    minEnroll: singular.minEnroll ?? null,
    maxEnroll: singular.maxEnroll ?? 0,
    maxWaitlist: singular.maxWaitlist ?? 0,
    openReserved: singular.openReserved ?? 0,
    seatReservationCount: normalizeSeatReservationCounts(
      singular.seatReservationCount
    ),
  } as EnrollmentModule.EnrollmentSingular;

  return normalized;
};

const normalizeSeatReservationTypes = (
  types: IEnrollmentHistoryItem["seatReservationTypes"]
) => {
  if (!types) return types;

  return types.filter(
    (
      type
    ): type is NonNullable<typeof type> & {
      number: number;
      requirementGroup: string;
      fromDate: string;
    } =>
      type !== undefined &&
      type.number !== undefined &&
      type.requirementGroup !== undefined &&
      type.fromDate !== undefined
  );
};

export const formatEnrollment = (enrollment: IEnrollmentHistoryItem) => {
  const history = enrollment.history?.map(normalizeEnrollmentSingular) ?? [];

  const output = {
    ...enrollment,
    seatReservationTypes: normalizeSeatReservationTypes(
      enrollment.seatReservationTypes
    ),
    history,

    latest: history.length > 0 ? history[history.length - 1] : null,
  } as EnrollmentModule.Enrollment;

  return output;
};
