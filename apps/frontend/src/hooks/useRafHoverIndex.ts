import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 100;

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitHoverIndex = useCallback((nextIndex: number | null) => {
    if (hoveredIndexRef.current === nextIndex) return;
    hoveredIndexRef.current = nextIndex;
    setHoveredIndex(nextIndex);
  }, []);

  const scheduleHoverIndex = useCallback(
    (nextIndex: number | null) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        commitHoverIndex(nextIndex);
      }, DEBOUNCE_MS);
    },
    [commitHoverIndex]
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
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

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
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
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
