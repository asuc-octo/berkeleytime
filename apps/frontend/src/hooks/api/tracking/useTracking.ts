import { useCallback, useEffect, useRef } from "react";

import { useMutation } from "@apollo/client/react";

import {
  TrackEventsDocument,
  TrackEventsMutation,
  TrackEventsMutationVariables,
  TrackingEventInput,
} from "@/lib/generated/graphql";

const BATCH_INTERVAL_MS = 5_000;
const MAX_BATCH_SIZE = 50;

/**
 * Unified tracking hook. Batches events client-side and flushes them
 * via a single `trackEvents` GraphQL mutation every 5 seconds or when
 * the batch reaches 50 events.
 */
export const useTracking = () => {
  const queueRef = useRef<TrackingEventInput[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Flush remaining events on unmount
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

  return { trackClick, trackView, trackDismiss, trackSearch, trackSearchClick };
};
