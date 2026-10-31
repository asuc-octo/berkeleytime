import {
  ENROLLMENT_MILESTONES,
  NOTIFICATION_EVENTS,
  NotificationEvent,
} from "@repo/common";
import { IEnrollmentHistoryItem } from "@repo/common/models";

export type EnrollmentSnapshot = IEnrollmentHistoryItem["history"][number];

const openSeats = (snapshot: EnrollmentSnapshot) =>
  Math.max(0, (snapshot.maxEnroll ?? 0) - (snapshot.enrolledCount ?? 0));

// Open seats that aren't held back for a seat reservation group
export const unreservedOpenSeats = (snapshot: EnrollmentSnapshot) =>
  Math.max(0, openSeats(snapshot) - (snapshot.openReserved ?? 0));

export const waitlistSpace = (snapshot: EnrollmentSnapshot) =>
  Math.max(0, (snapshot.maxWaitlist ?? 0) - (snapshot.waitlistedCount ?? 0));

const percentFull = (snapshot: EnrollmentSnapshot) =>
  snapshot.maxEnroll
    ? (snapshot.enrolledCount ?? 0) / snapshot.maxEnroll
    : null;

// Events that happened between two consecutive enrollment snapshots
export const detectNotificationEvents = (
  previous: EnrollmentSnapshot,
  latest: EnrollmentSnapshot
): NotificationEvent[] => {
  const previousPct = percentFull(previous);
  const latestPct = percentFull(latest);

  return NOTIFICATION_EVENTS.filter((event) => {
    const milestone = ENROLLMENT_MILESTONES[event];
    if (milestone !== undefined) {
      if (previousPct === null || latestPct === null) return false;
      return previousPct < milestone && latestPct >= milestone;
    }

    switch (event) {
      case "UNRESERVED_SEAT_OPENS":
        return (
          unreservedOpenSeats(previous) === 0 && unreservedOpenSeats(latest) > 0
        );
      // SIS doesn't expose individual positions, so a shrinking waitlist is
      // the closest signal that everyone still on it moved up
      case "WAITLIST_POSITION_IMPROVES":
        return (latest.waitlistedCount ?? 0) < (previous.waitlistedCount ?? 0);
      case "WAITLIST_SPACE_OPENS":
        return waitlistSpace(previous) === 0 && waitlistSpace(latest) > 0;
      default:
        return false;
    }
  });
};

export const describeNotificationEvent = (
  event: NotificationEvent,
  previous: EnrollmentSnapshot,
  latest: EnrollmentSnapshot
) => {
  const milestone = ENROLLMENT_MILESTONES[event];
  if (milestone !== undefined) {
    return `The class is now ${Math.round(milestone * 100)}% full (${latest.enrolledCount ?? 0} of ${latest.maxEnroll ?? 0} seats taken).`;
  }

  switch (event) {
    case "UNRESERVED_SEAT_OPENS": {
      const seats = unreservedOpenSeats(latest);
      return `${seats} unreserved seat${seats === 1 ? "" : "s"} opened up.`;
    }
    case "WAITLIST_POSITION_IMPROVES":
      return `The waitlist shrank from ${previous.waitlistedCount ?? 0} to ${latest.waitlistedCount ?? 0}, so waitlisted students moved up.`;
    case "WAITLIST_SPACE_OPENS": {
      const spots = waitlistSpace(latest);
      return `The waitlist has room again (${spots} spot${spots === 1 ? "" : "s"} open).`;
    }
    default:
      return "";
  }
};
