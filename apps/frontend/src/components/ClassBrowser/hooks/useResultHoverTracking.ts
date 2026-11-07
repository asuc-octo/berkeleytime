import { PointerEvent, useCallback, useEffect, useRef } from "react";

import { useTracking } from "@/hooks/api/tracking/useTracking";

// Fraction of browser sessions that report hover events. Stored per tab
// session so a session is either fully sampled or not at all, which keeps the
// duration distribution unbiased. Sent with each event so counts can be scaled.
const SAMPLE_RATE = 0.25;
const SAMPLE_STORAGE_KEY = "bt-result-hover-sampled";

// Hovers shorter than one frame are cursor jitter, not dwell
const MIN_HOVER_MS = 16;

// The list counts as scrolling until this long after the last scroll event
const SCROLL_IDLE_MS = 150;

// When content scrolls under a still cursor, browsers can fire pointerenter
// for the new card before that frame's scroll event. A hover this young when
// a scroll event arrives is treated as having started during the scroll.
const SCROLL_START_GRACE_MS = 50;

interface ActiveHover {
  index: number;
  targetId: string;
  start: number;
  startedDuringScroll: boolean;
  query: string | null;
  aiSearch: boolean;
}

interface HoverTarget {
  subject: string;
  courseNumber: string;
}

const isSessionSampled = (): boolean => {
  try {
    const stored = sessionStorage.getItem(SAMPLE_STORAGE_KEY);
    if (stored !== null) return stored === "1";
    const sampled = Math.random() < SAMPLE_RATE;
    sessionStorage.setItem(SAMPLE_STORAGE_KEY, sampled ? "1" : "0");
    return sampled;
  } catch {
    return false;
  }
};

/**
 * Tracks how long the mouse rests on each catalog result and whether that
 * hover ended in a click, as `course_result_hovered` events. Used to pick a
 * hover-to-prefetch threshold.
 *
 * To cut volume, only a sample of sessions report, and hovers that aren't
 * real dwell are dropped: non-mouse pointers, sub-frame jitter, and cards
 * that slid under a stationary cursor during a scroll without being clicked.
 */
export function useResultHoverTracking(query: string, aiSearch: boolean) {
  const { trackEvent, flushBeacon } = useTracking();

  const sampledRef = useRef<boolean | null>(null);
  const activeRef = useRef<ActiveHover | null>(null);
  const lastScrollAtRef = useRef(-Infinity);

  const isScrolling = () =>
    performance.now() - lastScrollAtRef.current < SCROLL_IDLE_MS;

  const endHover = useCallback(
    (clicked: boolean) => {
      const hover = activeRef.current;
      if (!hover) return;
      activeRef.current = null;

      const durationMs = Math.round(performance.now() - hover.start);
      if (!clicked) {
        if (durationMs < MIN_HOVER_MS) return;
        if (hover.startedDuringScroll && isScrolling()) return;
      }

      trackEvent("course_result_hovered", "class", hover.targetId, {
        durationMs,
        clicked,
        position: hover.index,
        query: hover.query,
        aiSearch: hover.aiSearch,
        startedDuringScroll: hover.startedDuringScroll,
        sampleRate: SAMPLE_RATE,
      });
    },
    [trackEvent]
  );

  const onPointerEnter = useCallback(
    (event: PointerEvent, index: number, target: HoverTarget) => {
      if (event.pointerType !== "mouse") return;
      sampledRef.current ??= isSessionSampled();
      if (!sampledRef.current) return;

      // pointerleave doesn't fire if the previous card unmounted under the cursor
      endHover(false);
      activeRef.current = {
        index,
        targetId: `${target.subject}-${target.courseNumber}`,
        start: performance.now(),
        startedDuringScroll: isScrolling(),
        query: query || null,
        aiSearch,
      };
    },
    [endHover, query, aiSearch]
  );

  const onPointerLeave = useCallback(
    (index: number) => {
      if (activeRef.current?.index === index) endHover(false);
    },
    [endHover]
  );

  const onClick = useCallback(
    (index: number) => {
      if (activeRef.current?.index === index) endHover(true);
    },
    [endHover]
  );

  // Listen at the document in the capture phase: depending on the browser's
  // layout, either the list container or the page itself is what scrolls
  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      lastScrollAtRef.current = now;

      const hover = activeRef.current;
      if (hover && now - hover.start <= SCROLL_START_GRACE_MS) {
        hover.startedDuringScroll = true;
      }
    };

    const options = { capture: true, passive: true };
    document.addEventListener("scroll", handleScroll, options);
    return () => document.removeEventListener("scroll", handleScroll, options);
  }, []);

  // End an in-progress hover when the tab is hidden or the page is left.
  // pagehide can fire before visibilitychange, and TrackingProvider's own
  // pagehide flush may already have run, so flush again after queueing.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") endHover(false);
    };
    const handlePageHide = () => {
      endHover(false);
      flushBeacon();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      endHover(false);
    };
  }, [endHover, flushBeacon]);

  return { onPointerEnter, onPointerLeave, onClick };
}
