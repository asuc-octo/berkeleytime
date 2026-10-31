import { NOTIFICATION_EVENT_LABELS } from "@repo/common";

import { NotificationEvent } from "@/lib/generated/graphql";

export const ALL_NOTIFICATION_EVENTS = Object.values(NotificationEvent);

export const getNotificationEventLabel = (event: NotificationEvent) =>
  NOTIFICATION_EVENT_LABELS[event];

const MILESTONES: [NotificationEvent, string][] = [
  [NotificationEvent.Enrollment_50, "50%"],
  [NotificationEvent.Enrollment_75, "75%"],
  [NotificationEvent.Enrollment_90, "90%"],
];

const joinList = (items: string[], conjunction: string) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`;

// Confirmation copy shown after a user changes what they're notified about
export const describeNotificationEvents = (
  events: NotificationEvent[],
  classLabel: string
) => {
  if (ALL_NOTIFICATION_EVENTS.every((event) => events.includes(event))) {
    return `You'll be notified about ${classLabel} enrollment milestones (50%, 75%, 90%), unreserved seat openings, and waitlist updates.`;
  }

  const milestones = MILESTONES.filter(([event]) => events.includes(event)).map(
    ([, label]) => label
  );

  const clauses = [
    milestones.length > 0 &&
      `when enrollment reaches ${joinList(milestones, "or")}`,
    events.includes(NotificationEvent.UnreservedSeatOpens) &&
      "when an unreserved seat opens",
    events.includes(NotificationEvent.WaitlistPositionImproves) &&
      "when your waitlist position improves",
    events.includes(NotificationEvent.WaitlistSpaceOpens) &&
      "when there is space to join the waitlist",
  ].filter((clause): clause is string => !!clause);

  return `You'll be notified ${joinList(clauses, "and")} in ${classLabel}`;
};
