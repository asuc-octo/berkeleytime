export const MAX_BATCH_SIZE = 50;
export const MAX_EVENT_BYTES = 4_096;
export const OUTREACH_TARGETS = [
  "banner",
  "redirect",
  "targeted-message",
  "nav-item",
] as const;

// Keep this list in step with TrackingProvider callers. Unknown pairs must not
// be normalized into known ones (e.g. "c$lick" must never become "click").
const EVENT_TARGETS: Record<string, readonly string[]> = {
  click: [...OUTREACH_TARGETS, "apply-button"],
  view: ["banner", "class"],
  dismiss: ["banner"],
  search: ["course"],
  search_click: ["course"],
  schedule_saved: ["schedule"],
  schedule_generate: ["schedule"],
  course_result_clicked: ["class"],
  search_filter_applied: ["catalog_filter"],
  page_error: ["course-discovery"],
  data_load_failed: ["course-discovery"],
  search_failed: ["course-discovery"],
};

export interface TrackingEventInput {
  eventType: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export class InvalidTrackingBatch extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const sanitizeMetadata = (
  obj: Record<string, unknown>,
  depth = 0
): Record<string, unknown> => {
  if (depth >= 2) return {};
  const result: Record<string, unknown> = Object.create(null);
  for (const [key, value] of Object.entries(obj).slice(0, 20)) {
    const safeKey = key.replace(/[$.]/g, "_").slice(0, 64);
    if (typeof value === "string") result[safeKey] = value.slice(0, 256);
    else if (typeof value === "number") {
      if (Number.isFinite(value)) result[safeKey] = value;
    } else if (typeof value === "boolean" || value === null)
      result[safeKey] = value;
    else if (isRecord(value))
      result[safeKey] = sanitizeMetadata(value, depth + 1);
    // Arrays/other values are omitted rather than stringifying nested input.
  }
  return result;
};

export const validateTrackingBatch = (
  events: unknown
): TrackingEventInput[] => {
  if (
    !Array.isArray(events) ||
    events.length === 0 ||
    events.length > MAX_BATCH_SIZE
  ) {
    throw new InvalidTrackingBatch("Expected 1 to 50 tracking events");
  }
  return events.map((event: unknown) => {
    if (
      !isRecord(event) ||
      typeof event.eventType !== "string" ||
      typeof event.targetType !== "string" ||
      !Object.hasOwn(EVENT_TARGETS, event.eventType) ||
      !EVENT_TARGETS[event.eventType].includes(event.targetType) ||
      typeof event.timestamp !== "string" ||
      event.timestamp.length > 128 ||
      (event.targetId != null &&
        (typeof event.targetId !== "string" ||
          event.targetId.length > 128 ||
          event.targetId.length === 0)) ||
      (event.metadata != null && !isRecord(event.metadata))
    ) {
      throw new InvalidTrackingBatch("Invalid tracking event");
    }
    const metadata = event.metadata
      ? sanitizeMetadata(event.metadata as Record<string, unknown>)
      : undefined;
    return {
      eventType: event.eventType,
      targetType: event.targetType,
      targetId: typeof event.targetId === "string" ? event.targetId : undefined,
      timestamp: event.timestamp,
      metadata:
        metadata && Buffer.byteLength(JSON.stringify(metadata)) <= 1_024
          ? metadata
          : undefined,
    };
  });
};

// Client clocks are diagnostic only. An invalid or distant clock never causes
// loss of an otherwise valid event or determines its reporting date.
export const parseClientTimestamp = (value: string): string | undefined => {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value
    )
  )
    return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
};
