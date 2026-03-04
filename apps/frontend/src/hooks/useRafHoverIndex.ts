import { useCallback, useEffect, useRef, useState } from "react";

interface UseRafHoverIndexResult {
  hoveredIndex: number | null;
  hoverCard: (index: number) => void;
  clearHover: () => void;
  shiftAfterRemoval: (removedIndex: number) => void;
}

export default function useRafHoverIndex(
  initialHoveredIndex: number | null = null
): UseRafHoverIndexResult {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(
    initialHoveredIndex
  );
  const hoveredIndexRef = useRef<number | null>(initialHoveredIndex);
  const pendingIndexRef = useRef<number | null | undefined>(undefined);
  const animationFrameRef = useRef<number | null>(null);

  const commitHoverIndex = useCallback((nextIndex: number | null) => {
    if (hoveredIndexRef.current === nextIndex) return;
    hoveredIndexRef.current = nextIndex;
    setHoveredIndex(nextIndex);
  }, []);

  const flushPendingHoverIndex = useCallback(() => {
    animationFrameRef.current = null;
    if (pendingIndexRef.current === undefined) return;

    const nextIndex = pendingIndexRef.current;
    pendingIndexRef.current = undefined;
    commitHoverIndex(nextIndex);
  }, [commitHoverIndex]);

  const scheduleHoverIndex = useCallback(
    (nextIndex: number | null) => {
      if (typeof window === "undefined") {
        commitHoverIndex(nextIndex);
        return;
      }

      pendingIndexRef.current = nextIndex;
      if (animationFrameRef.current !== null) return;

      animationFrameRef.current = window.requestAnimationFrame(
        flushPendingHoverIndex
      );
    },
    [commitHoverIndex, flushPendingHoverIndex]
  );

  const hoverCard = useCallback(
    (index: number) => {
      scheduleHoverIndex(index);
    },
    [scheduleHoverIndex]
  );

  const clearHover = useCallback(() => {
    scheduleHoverIndex(null);
  }, [scheduleHoverIndex]);

  const shiftAfterRemoval = useCallback(
    (removedIndex: number) => {
      const currentIndex = hoveredIndexRef.current;
      if (currentIndex === null) return;

      if (currentIndex === removedIndex) {
        commitHoverIndex(null);
        return;
      }

      if (currentIndex > removedIndex) {
        commitHoverIndex(currentIndex - 1);
      }
    },
    [commitHoverIndex]
  );

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    hoveredIndex,
    hoverCard,
    clearHover,
    shiftAfterRemoval,
  };
}
