import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { FrameAltEmpty } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { LoadingIndicator } from "@repo/theme";

import ClassCard from "@/components/ClassCard";

import Header from "../Header";
import {
  isInputElement,
  useAutoLoadOnFocus,
  useContainerFocus,
  useFocusRingTimer,
  useKeyboardNavigation,
} from "../keyboardHelpers";
import useBrowser from "../useBrowser";
import styles from "./List.module.scss";

interface ListProps {
  onSelect: (subject: string, courseNumber: string, number: string) => void;
}

export default function List({ onSelect }: ListProps) {
  const { classes, loading } = useBrowser();
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  // Keyboard navigation helpers
  const { showFocusRing, showFocusRingTemporarily, hideFocusRing } =
    useFocusRingTimer();
  const isListFocused = useContainerFocus(rootRef);

  const virtualizer = useVirtualizer({
    count: classes.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 136,
    paddingStart: 72,
    gap: 12,
  });

  // Reset scroll position and focus when search params change
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
    setFocusedIndex(0);
    hideFocusRing();
  }, [searchParams, hideFocusRing]);

  // Reset focus when classes change (filters, search, etc.)
  useEffect(() => {
    setFocusedIndex(0);
    hideFocusRing();
  }, [classes, hideFocusRing]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < classes.length) {
      virtualizer.scrollToIndex(focusedIndex, { align: "auto" });
    }
  }, [focusedIndex, virtualizer, classes.length]);

  // Keyboard navigation
  useKeyboardNavigation({
    items: classes,
    containerRef: rootRef,
    focusedIndex,
    setFocusedIndex,
    onSelect: (focusedClass) => {
      onSelect(
        focusedClass.course.subject,
        focusedClass.course.number,
        focusedClass.number
      );
    },
    isContainerFocused: isListFocused,
    showFocusRing: showFocusRingTemporarily,
  });

  // Auto-load focused item after debounce
  useAutoLoadOnFocus(
    classes,
    focusedIndex,
    isListFocused,
    (focusedClass) => {
      onSelect(
        focusedClass.course.subject,
        focusedClass.course.number,
        focusedClass.number
      );
    },
    300
  );

  const items = virtualizer.getVirtualItems();

  const handleClassClick = (index: number) => {
    setFocusedIndex(index);
    hideFocusRing();
    const _class = classes[index];
    onSelect(_class.course.subject, _class.course.number, _class.number);
  };

  const handleListClick = (e: React.MouseEvent) => {
    // Don't focus the list if clicking on an input or textarea
    if (isInputElement(e.target)) {
      return;
    }
    // Ensure list is focused when clicked so keyboard nav works
    rootRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={styles.root}
      tabIndex={0}
      onClick={handleListClick}
    >
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
