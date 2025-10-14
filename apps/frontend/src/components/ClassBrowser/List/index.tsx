import { useCallback, useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { FrameAltEmpty } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { LoadingIndicator } from "@repo/theme";

import ClassCard from "@/components/ClassCard";

import Header from "../Header";
import useBrowser from "../useBrowser";
import styles from "./List.module.scss";

interface ListProps {
  onSelect: (subject: string, courseNumber: string, number: string) => void;
}

export default function List({ onSelect }: ListProps) {
  const { classes, loading } = useBrowser();
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isListFocused, setIsListFocused] = useState<boolean>(false);
  const [showFocusRing, setShowFocusRing] = useState<boolean>(false);
  const focusRingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  const virtualizer = useVirtualizer({
    count: classes.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 136,
    paddingStart: 72,
    gap: 12,
  });

  // Helper to show focus ring and auto-hide after 1 second
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

  // Reset scroll position and focus when search params change
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
    setFocusedIndex(0);
    setShowFocusRing(false); // Hide focus ring on search
  }, [searchParams]);

  // Reset focus when classes change (filters, search, etc.)
  useEffect(() => {
    setFocusedIndex(0);
    setShowFocusRing(false); // Hide focus ring on filter change
  }, [classes]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < classes.length) {
      virtualizer.scrollToIndex(focusedIndex, { align: "auto" });
    }
  }, [focusedIndex, virtualizer, classes.length]);

  // Auto-load focused item after debounce (only when list is focused)
  useEffect(() => {
    if (classes.length === 0 || !isListFocused) return;

    const timer = setTimeout(() => {
      const focusedClass = classes[focusedIndex];
      if (focusedClass) {
        onSelect(
          focusedClass.course.subject,
          focusedClass.course.number,
          focusedClass.number
        );
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [focusedIndex, classes, onSelect, isListFocused]);

  // Track focus state of the list
  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return;

    const handleFocus = () => setIsListFocused(true);
    const handleBlur = () => setIsListFocused(false);

    rootElement.addEventListener("focus", handleFocus);
    rootElement.addEventListener("blur", handleBlur);

    return () => {
      rootElement.removeEventListener("focus", handleFocus);
      rootElement.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (classes.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, classes.length - 1));
          showFocusRingTemporarily(); // Show focus ring on keyboard nav
          // Ensure list is focused when navigating
          if (!isListFocused) {
            rootRef.current?.focus();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          showFocusRingTemporarily(); // Show focus ring on keyboard nav
          // Ensure list is focused when navigating
          if (!isListFocused) {
            rootRef.current?.focus();
          }
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          const focusedClass = classes[focusedIndex];
          if (focusedClass) {
            onSelect(
              focusedClass.course.subject,
              focusedClass.course.number,
              focusedClass.number
            );
          }
          break;
        }
      }
    };

    const rootElement = rootRef.current;
    if (rootElement) {
      rootElement.addEventListener("keydown", handleKeyDown);
      return () => rootElement.removeEventListener("keydown", handleKeyDown);
    }
  }, [classes, focusedIndex, onSelect, isListFocused, showFocusRingTemporarily]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (focusRingTimerRef.current) {
        clearTimeout(focusRingTimerRef.current);
      }
    };
  }, []);

  const items = virtualizer.getVirtualItems();

  const handleClassClick = (index: number) => {
    setFocusedIndex(index);
    setShowFocusRing(false); // Hide focus ring on click
    const _class = classes[index];
    onSelect(_class.course.subject, _class.course.number, _class.number);
  };

  const handleListClick = (e: React.MouseEvent) => {
    // Don't focus the list if clicking on an input or textarea
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    // Ensure list is focused when clicked so keyboard nav works
    rootRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={styles.root} tabIndex={0} onClick={handleListClick}>
      <div
        className={styles.view}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        <Header />
        {loading && items.length === 0 ? (
          <div className={styles.placeholder}>
            <LoadingIndicator size="lg" />
            <p className={styles.heading}>Fetching courses...</p>
            <p className={styles.description}>
              Search for, filter, and sort courses to narrow down your results.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.placeholder}>
            <FrameAltEmpty width={32} height={32} />
            <p className={styles.heading}>No courses found</p>
            <p className={styles.description}>
              Find courses by broadening your search or entering a different
              query.
            </p>
          </div>
        ) : (
          <div
            className={styles.body}
            style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}
          >
            {items.map(({ key, index }) => {
              const _class = classes[index];

              return (
                <ClassCard
                  class={_class}
                  data-index={index}
                  key={key}
                  ref={virtualizer.measureElement}
                  active={showFocusRing && index === focusedIndex}
                  onClick={() => handleClassClick(index)}
                />
              );
            })}
          </div>
        )}
        {/* <div className={styles.footer}>
          <Link to="/discover" className={styles.button}>
            <Sparks />
            <p className={styles.text}>Try discovering courses</p>
            <ArrowRight />
          </Link>
        </div> */}
      </div>
    </div>
  );
}
