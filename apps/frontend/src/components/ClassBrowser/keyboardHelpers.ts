import { RefObject, useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook to manage focus ring visibility with auto-hide timer
 */
export function useFocusRingTimer() {
  const [showFocusRing, setShowFocusRing] = useState<boolean>(false);
  const focusRingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showFocusRingTemporarily = useCallback(() => {
    setShowFocusRing(true);

    // Clear existing timer
    if (focusRingTimerRef.current) {
      clearTimeout(focusRingTimerRef.current);
    }

    // Set new timer to hide after 1 second
    focusRingTimerRef.current = setTimeout(() => {
      setShowFocusRing(false);
    }, 1000);
  }, []);

  const hideFocusRing = useCallback(() => {
    setShowFocusRing(false);
    if (focusRingTimerRef.current) {
      clearTimeout(focusRingTimerRef.current);
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (focusRingTimerRef.current) {
        clearTimeout(focusRingTimerRef.current);
      }
    };
  }, []);

  return { showFocusRing, showFocusRingTemporarily, hideFocusRing };
}

/**
 * Hook to track focus state of a container element
 */
export function useContainerFocus(containerRef: RefObject<HTMLElement | null>) {
  const [isContainerFocused, setIsContainerFocused] = useState<boolean>(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleFocus = () => setIsContainerFocused(true);
    const handleBlur = () => setIsContainerFocused(false);

    element.addEventListener("focus", handleFocus);
    element.addEventListener("blur", handleBlur);

    return () => {
      element.removeEventListener("focus", handleFocus);
      element.removeEventListener("blur", handleBlur);
    };
  }, [containerRef]);

  return isContainerFocused;
}

/**
 * Check if the event target is an input element that should not trigger keyboard navigation
 */
export function isInputElement(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  );
}

/**
 * Handles keyboard navigation (ArrowUp, ArrowDown, Enter, Space)
 */
export function useKeyboardNavigation<T>({
  items,
  containerRef,
  focusedIndex,
  setFocusedIndex,
  onSelect,
  isContainerFocused,
  showFocusRing,
}: {
  items: T[];
  containerRef: RefObject<HTMLElement | null>;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  onSelect: (item: T, index: number) => void;
  isContainerFocused: boolean;
  showFocusRing: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events when typing in inputs
      if (isInputElement(e.target)) {
        return;
      }

      if (items.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex(Math.min(focusedIndex + 1, items.length - 1));
          showFocusRing();
          // Ensure container is focused when navigating
          if (!isContainerFocused) {
            containerRef.current?.focus();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex(Math.max(focusedIndex - 1, 0));
          showFocusRing();
          // Ensure container is focused when navigating
          if (!isContainerFocused) {
            containerRef.current?.focus();
          }
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          const focusedItem = items[focusedIndex];
          if (focusedItem) {
            onSelect(focusedItem, focusedIndex);
          }
          break;
        }
      }
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener("keydown", handleKeyDown);
      return () => element.removeEventListener("keydown", handleKeyDown);
    }
  }, [
    items,
    focusedIndex,
    setFocusedIndex,
    onSelect,
    isContainerFocused,
    showFocusRing,
    containerRef,
  ]);
}

/**
 * Auto-loads an item after a debounce delay when focused
 */
export function useAutoLoadOnFocus<T>(
  items: T[],
  focusedIndex: number,
  isContainerFocused: boolean,
  onLoad: (item: T, index: number) => void,
  debounceMs: number = 300
) {
  useEffect(() => {
    if (items.length === 0 || !isContainerFocused) return;

    const timer = setTimeout(() => {
      const focusedItem = items[focusedIndex];
      if (focusedItem) {
        onLoad(focusedItem, focusedIndex);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [focusedIndex, items, onLoad, isContainerFocused, debounceMs]);
}
