import { useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FrameAltEmpty } from "iconoir-react";

import ClassCard from "@/components/ClassCard";
import ClassCardSkeleton from "@/components/ClassCard/Skeleton";
import { RecentType, getRecents } from "@/lib/recent";

import Header from "../Header";
import useBrowser from "../useBrowser";
import styles from "./List.module.scss";

interface ListProps {
  onSelect: (
    subject: string,
    courseNumber: string,
    number: string,
    sessionId: string
  ) => void;
}

const MAX_RECENTLY_VIEWED = 5;

export default function List({ onSelect }: ListProps) {
  const { classes, loading, year, semester, query, aiSearchActive } = useBrowser();
  const shouldReduceMotion = useReducedMotion();
  const [recentlyViewedVersion, setRecentlyViewedVersion] = useState(0);
  const [visibleRecentCount, setVisibleRecentCount] =
    useState(MAX_RECENTLY_VIEWED);
  const [showTopFade, setShowTopFade] = useState(false);

  const catalogScrollRef = useRef<HTMLDivElement>(null);
  const recentlyViewedListRef = useRef<HTMLDivElement>(null);
  const recentlyViewedMeasureRef = useRef<HTMLDivElement>(null);

  const recentlyViewed = useMemo(() => {
    const allRecents = getRecents(RecentType.Class);
    const seenCourses = new Set<string>();

    return allRecents
      .filter((recent) => recent.year === year && recent.semester === semester)
      .filter((recent) => {
        const key = `${recent.subject}-${recent.courseNumber}`;
        if (seenCourses.has(key)) return false;
        seenCourses.add(key);
        return true;
      })
      .slice(0, MAX_RECENTLY_VIEWED);
  }, [year, semester, recentlyViewedVersion]);

  const recentlyViewedClasses = useMemo(() => {
    return recentlyViewed
      .map((recent) => {
        return classes.find(
          (c) =>
            c.subject === recent.subject &&
            c.courseNumber === recent.courseNumber &&
            c.number === recent.number
        );
      })
      .filter((c) => c !== undefined);
  }, [recentlyViewed, classes]);

  const showRecentlyViewed = !query && recentlyViewedClasses.length > 0;
  const visibleRecentlyViewedClasses = useMemo(
    () => recentlyViewedClasses.slice(0, visibleRecentCount),
    [recentlyViewedClasses, visibleRecentCount]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === RecentType.Class) {
        setRecentlyViewedVersion((v) => v + 1);
      }
    };

    const handleRecentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: RecentType }>;
      if (customEvent.detail.type === RecentType.Class) {
        setRecentlyViewedVersion((v) => v + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("recent-updated", handleRecentUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("recent-updated", handleRecentUpdate);
    };
  }, []);

  useEffect(() => {
    if (!showRecentlyViewed) return;

    const listElement = recentlyViewedListRef.current;
    const measureElement = recentlyViewedMeasureRef.current;
    if (!listElement || !measureElement) return;

    const updateVisibleRecentCount = () => {
      const containerWidth = listElement.clientWidth;
      const measureItems = Array.from(measureElement.children) as HTMLElement[];

      if (containerWidth <= 0 || measureItems.length === 0) {
        setVisibleRecentCount(0);
        return;
      }

      const computedStyles = window.getComputedStyle(listElement);
      const gap = Number.parseFloat(computedStyles.columnGap || "0") || 0;

      let usedWidth = 0;
      let nextVisibleCount = 0;

      for (const item of measureItems) {
        const itemWidth = item.getBoundingClientRect().width;
        const nextWidth =
          nextVisibleCount === 0 ? itemWidth : usedWidth + gap + itemWidth;

        if (nextWidth > containerWidth) break;

        usedWidth = nextWidth;
        nextVisibleCount += 1;
      }

      setVisibleRecentCount(nextVisibleCount);
    };

    updateVisibleRecentCount();
    const observer = new ResizeObserver(updateVisibleRecentCount);
    observer.observe(listElement);
    observer.observe(measureElement);

    return () => observer.disconnect();
  }, [showRecentlyViewed, recentlyViewedClasses]);

  useEffect(() => {
    const scrollElement = catalogScrollRef.current;
    if (!scrollElement) return;

    const updateFadeVisibility = () => {
      setShowTopFade(scrollElement.scrollTop > 0);
    };

    updateFadeVisibility();
    scrollElement.addEventListener("scroll", updateFadeVisibility, {
      passive: true,
    });

    return () => {
      scrollElement.removeEventListener("scroll", updateFadeVisibility);
    };
  }, [loading, classes.length]);

  const virtualizer = useVirtualizer({
    count: classes.length,
    getScrollElement: () => catalogScrollRef.current,
    estimateSize: () => 136,
    paddingStart: 0, // No padding needed - Recently Viewed section handles spacing
    paddingEnd: 12,
    gap: 12,
    overscan: 5, // Keep extra items rendered for smoother scrolling
  });

  const items = virtualizer.getVirtualItems();

  const handleClassClick = (index: number) => {
    const selected = classes[index];
    if (!selected) return;
    onSelect(
      selected.subject,
      selected.courseNumber,
      selected.number,
      selected.sessionId
    );
  };

  const isLoading = loading && classes.length === 0;

  return (
    <div className={styles.root}>
      <div
        className={`${styles.topSection} ${showTopFade ? styles.topSectionScrolled : ""}`}
      >
        <Header />
        <div className={styles.recentlyViewedSection}>
          {!aiSearchActive && showRecentlyViewed && (
            <div className={styles.recentlyViewed}>
              <div
                ref={recentlyViewedListRef}
                className={styles.recentlyViewedList}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleRecentlyViewedClasses.map((_class) => (
                    <motion.button
                      type="button"
                      className={styles.recentlyViewedTagButton}
                      key={`recent-${_class.subject}-${_class.courseNumber}-${_class.number}`}
                      layout={shouldReduceMotion ? false : "position"}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: -6, scale: 0.96 }
                      }
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0, scale: 1 }
                      }
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 6, scale: 0.96 }
                      }
                      transition={{
                        duration: shouldReduceMotion ? 0.01 : 0.22,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        catalogScrollRef.current?.blur();
                        onSelect(
                          _class.subject,
                          _class.courseNumber,
                          _class.number,
                          _class.sessionId
                        );
                      }}
                    >
                      <span className={styles.recentlyViewedTagLabel}>
                        {_class.subject.slice(0, 4)} {_class.courseNumber}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
              <div
                ref={recentlyViewedMeasureRef}
                className={styles.recentlyViewedMeasureList}
                aria-hidden
              >
                {recentlyViewedClasses.map((_class) => (
                  <span
                    className={styles.recentlyViewedMeasureItem}
                    key={`recent-measure-${_class.subject}-${_class.courseNumber}-${_class.number}`}
                  >
                    <span className={styles.recentlyViewedTagLabel}>
                      {_class.subject.slice(0, 4)} {_class.courseNumber}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        ref={catalogScrollRef}
        className={styles.catalogScroll}
        style={isLoading ? { overflow: "hidden" } : undefined}
      >
        {loading && classes.length === 0 ? (
          <div className={styles.skeletonContainer}>
            {[...Array(8)].map((_, i) => (
              <ClassCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : classes.length === 0 ? (
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
            className={styles.view}
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
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
                    onClick={() => handleClassClick(index)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* <div className={styles.footer}>
        <Link to="/discover" className={styles.button}>
          <Sparks />
          <p className={styles.text}>Try discovering courses</p>
          <ArrowRight />
        </Link>
      </div> */}
    </div>
  );
}
