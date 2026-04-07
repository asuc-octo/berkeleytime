export type SeatReservationCountLike = {
  number?: number;
  maxEnroll?: number;
};

export type SeatReservationTypeLike = {
  number?: number;
  fromDate?: string;
};

export const computeActiveReservedMaxCount = (
  seatReservationCount: SeatReservationCountLike[] | undefined,
  seatReservationTypes: SeatReservationTypeLike[] | undefined
): number => {
  const counts = seatReservationCount ?? [];
  if (counts.length === 0) return 0;

  const types = seatReservationTypes ?? [];
  const now = new Date();

  return counts.reduce((sum, reservation) => {
    const maxEnroll = reservation.maxEnroll ?? 0;
    const matchingType = types.find(
      (type) => type.number === reservation.number
    );
    const fromDate = matchingType?.fromDate ?? "";
    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const hasValidFromDate =
      fromDateObj !== null && !Number.isNaN(fromDateObj.getTime());

    const isActive =
      maxEnroll > 1 &&
      (!hasValidFromDate || (fromDateObj && fromDateObj <= now));

    return sum + (isActive ? maxEnroll : 0);
  }, 0);
};
