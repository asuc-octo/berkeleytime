export const NOTIFICATION_EVENTS = [
  "ENROLLMENT_50",
  "ENROLLMENT_75",
  "ENROLLMENT_90",
  "UNRESERVED_SEAT_OPENS",
  "WAITLIST_POSITION_IMPROVES",
  "WAITLIST_SPACE_OPENS",
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  ENROLLMENT_50: "When 50% full",
  ENROLLMENT_75: "When 75% full",
  ENROLLMENT_90: "When 90% full",
  UNRESERVED_SEAT_OPENS: "When an unreserved seat opens",
  WAITLIST_POSITION_IMPROVES: "When my waitlist position improves",
  WAITLIST_SPACE_OPENS: "When there is space to join the waitlist",
};

// Enrollment milestones fire once per subscription; the other events can recur
export const ENROLLMENT_MILESTONES: Partial<Record<NotificationEvent, number>> =
  {
    ENROLLMENT_50: 0.5,
    ENROLLMENT_75: 0.75,
    ENROLLMENT_90: 0.9,
  };
