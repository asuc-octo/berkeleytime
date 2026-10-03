import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { useMutation } from "@apollo/client/react";

import {
  TrackEventsDocument,
  TrackEventsMutation,
  TrackEventsMutationVariables,
  TrackingEventInput,
} from "@/lib/generated/graphql";

const BATCH_INTERVAL_MS = 30_000;
const MAX_BATCH_SIZE = 50;
const BEACON_URL = "/api/tracking/beacon";

const sendBeacon = (events: TrackingEventInput[]): void => {
  if (events.length === 0) return;
  const blob = new Blob([JSON.stringify({ events })], {
    type: "application/json",
  });
  navigator.sendBeacon(BEACON_URL, blob);
};

export interface TrackingContextValue {
  trackClick: (
    targetType: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ) => void;
  trackView: (
    targetType: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ) => void;
  trackDismiss: (
    targetType: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ) => void;
  trackSearch: (query: string, resultCount: number) => void;
  trackSearchClick: (
    query: string,
    targetId: string,
    resultIndex: number
  ) => void;
  /**
   * Escape hatch for events that are not a click/view/dismiss/search —
   * e.g. "schedule_saved". Prefer the named helpers above when one fits.
   */
  trackEvent: (
    eventType: string,
    targetType: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ) => void;
  trackSessionStart: (
    targetType: string,
    metadata?: Record<string, unknown>
  ) => void;
  trackSessionEnd: (
    targetType: string,
    metadata?: Record<string, unknown>
  ) => void;
  flushBeacon: () => void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<TrackingEventInput[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionsRef = useRef(
    new Map<string, { id: string; startedAt: number }>()
  );

  const [mutate] = useMutation<
    TrackEventsMutation,
    TrackEventsMutationVariables
  >(TrackEventsDocument);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (queueRef.current.length === 0) return;

    const batch = queueRef.current.splice(0, MAX_BATCH_SIZE);
    mutate({ variables: { events: batch } }).catch(() => {
      // Silently drop failed tracking events — not worth retrying
    });
  }, [mutate]);

  const flushBeacon = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const remaining = queueRef.current.splice(0);
    sendBeacon(remaining);
  }, []);

  const enqueue = useCallback(
    (event: Omit<TrackingEventInput, "timestamp">) => {
      queueRef.current.push({
        ...event,
        timestamp: new Date().toISOString(),
      });

      if (queueRef.current.length >= MAX_BATCH_SIZE) {
        flush();
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(flush, BATCH_INTERVAL_MS);
      }
    },
    [flush]
  );

  useEffect(() => {
    const handlePageHide = () => flushBeacon();
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [flushBeacon]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (queueRef.current.length > 0) {
        mutate({ variables: { events: queueRef.current } }).catch(() => {});
      }
    };
  }, [mutate]);

  const trackClick = useCallback(
    (
      targetType: string,
      targetId?: string,
      metadata?: Record<string, unknown>
    ) => enqueue({ eventType: "click", targetType, targetId, metadata }),
    [enqueue]
  );

  const trackView = useCallback(
    (
      targetType: string,
      targetId?: string,
      metadata?: Record<string, unknown>
    ) => enqueue({ eventType: "view", targetType, targetId, metadata }),
    [enqueue]
  );

  const trackDismiss = useCallback(
    (
      targetType: string,
      targetId?: string,
      metadata?: Record<string, unknown>
    ) => enqueue({ eventType: "dismiss", targetType, targetId, metadata }),
    [enqueue]
  );

  const trackSearch = useCallback(
    (query: string, resultCount: number) =>
      enqueue({
        eventType: "search",
        targetType: "course",
        metadata: { query, resultCount },
      }),
    [enqueue]
  );

  const trackSearchClick = useCallback(
    (query: string, targetId: string, resultIndex: number) =>
      enqueue({
        eventType: "search_click",
        targetType: "course",
        targetId,
        metadata: { query, resultIndex },
      }),
    [enqueue]
  );

  const trackEvent = useCallback(
    (
      eventType: string,
      targetType: string,
      targetId?: string,
      metadata?: Record<string, unknown>
    ) => enqueue({ eventType, targetType, targetId, metadata }),
    [enqueue]
  );

  const trackSessionStart = useCallback(
    (targetType: string, metadata?: Record<string, unknown>) => {
      // ignore duplicate starts
      if (sessionsRef.current.has(targetType)) return;

      // create session happens in provider so future Bt devs can use this
      const id = crypto.randomUUID();
      sessionsRef.current.set(targetType, { id, startedAt: Date.now() });

      enqueue({
        eventType: "session_start",
        targetType,
        targetId: id,
        metadata,
      });
    },
    [enqueue]
  );

  const trackSessionEnd = useCallback(
    (targetType: string, metadata?: Record<string, unknown>) => {
      const session = sessionsRef.current.get(targetType);

      // ignore session with no session start
      if (!session) return;
      sessionsRef.current.delete(targetType);

      enqueue({
        eventType: "session_end",
        targetType,
        targetId: session.id, // defined in trackSessionStart
        metadata: { ...metadata, durationMs: Date.now() - session.startedAt },
      });
    },

    [enqueue]
  );

  return (
    <TrackingContext.Provider
      value={{
        trackClick,
        trackView,
        trackDismiss,
        trackSearch,
        trackSearchClick,
        trackEvent,
        trackSessionStart,
        trackSessionEnd,
        flushBeacon,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTrackingContext(): TrackingContextValue {
  const ctx = useContext(TrackingContext);
  if (!ctx)
    throw new Error("useTrackingContext must be used within TrackingProvider");
  return ctx;
}
