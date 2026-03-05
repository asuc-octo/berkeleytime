import { useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FrameAltEmpty } from "iconoir-react";

import ClassCard from "@/components/ClassCard";
import ClassCardSkeleton from "@/components/ClassCard/Skeleton";
import { ICatalogClassServer } from "@/lib/api/catalog";
import { RecentType, getRecents } from "@/lib/recent";

import Header from "../Header";
import { useLayoutContext } from "../context/LayoutContext";
import { useListContext } from "../context/ListContext";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./List.module.scss";

// Adapt ICatalogClassServer to the shape ClassCard expects
const adaptForClassCard = (_class: ICatalogClassServer) => ({
  subject: _class.subject,
  courseNumber: _class.courseNumber,
  number: _class.number,
  title: _class.title ?? _class.courseTitle,
  unitsMax: _class.unitsMax,
  unitsMin: _class.unitsMin,
  course: {
    title: _class.courseTitle,
    gradeDistribution:
      _class.allTimeAverageGrade != null
        ? { average: _class.allTimeAverageGrade, pnpPercentage: null }
        : undefined,
    aggregatedRatings: _class.aggregatedRatings,
  },
  primarySection: {
    enrollment: {
      latest: {
        enrolledCount: _class.enrolledCount,
        maxEnroll: _class.maxEnroll,
        activeReservedMaxCount: _class.activeReservedMaxCount,
      },
    },
  },
});

interface ListProps {
  onSelect: (
    subject: string,
    courseNumber: string,
    number: string,
    sessionId: string
  ) => void;
}

const MAX_RECENTLY_VIEWED = 5;
const LOAD_MORE_THRESHOLD_PX = 320;

type RecentClassItem = {
  subject: string;
  courseNumber: string;
  number: string;
  sessionId?: string;
};

type RecentlyViewedEntry = {
  key: string;
  subject: string;
  courseNumber: string;
  number: string;
  sessionId: string | null;
};

const getRecentClassKey = (
  recent: Pick<RecentClassItem, "subject" | "courseNumber" | "number">
) => `${recent.subject}-${recent.courseNumber}-${recent.number}`;

export default function List({ onSelect }: ListProps) {
  const { classes, loading, hasNextPage, loadNextPage, isLoadingNextPage } =
    useListContext();

  const { year, semester } = useLayoutContext();

  const shouldReduceMotion = useReducedMotion();
  const [recentlyViewedVersion, setRecentlyViewedVersion] = useState(0);
  const [visibleRecentCount, setVisibleRecentCount] =
    useState(MAX_RECENTLY_VIEWED);
  const [resolvedSessionIds, setResolvedSessionIds] = useState<
    Record<string, string>
  >({});
  const [showTopFade, setShowTopFade] = useState(false);

  const catalogScrollRef = useRef<HTMLDivElement>(null);
  const recentlyViewedListRef = useRef<HTMLDivElement>(null);
  const recentlyViewedMeasureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResolvedSessionIds({});
  }, [year, semester]);

  const recentlyViewed = useMemo<RecentClassItem[]>(() => {
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

  const recentlyViewedEntries = useMemo<RecentlyViewedEntry[]>(() => {
    return recentlyViewed.map((recent) => {
      const key = getRecentClassKey(recent);
      const fallbackSessionId = classes.find(
        (catalogClass) =>
          catalogClass.subject === recent.subject &&
          catalogClass.courseNumber === recent.courseNumber &&
          catalogClass.number === recent.number
      )?.sessionId;

      return {
        key,
        subject: recent.subject,
        courseNumber: recent.courseNumber,
        number: recent.number,
        sessionId:
          recent.sessionId ??
          resolvedSessionIds[key] ??
          fallbackSessionId ??
          null,
      };
    });
  }, [recentlyViewed, classes, resolvedSessionIds]);

  useEffect(() => {
    setResolvedSessionIds((previous) => {
      let changed = false;
      const next = { ...previous };

      recentlyViewedEntries.forEach((entry) => {
        if (!entry.sessionId || next[entry.key]) return;
        next[entry.key] = entry.sessionId;
        changed = true;
      });

      return changed ? next : previous;
    });
  }, [recentlyViewedEntries]);

  const showRecentlyViewed = recentlyViewedEntries.length > 0;
  const visibleRecentlyViewedClasses = useMemo(
    () => recentlyViewedEntries.slice(0, visibleRecentCount),
    [recentlyViewedEntries, visibleRecentCount]
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
  }, [showRecentlyViewed, recentlyViewedEntries]);

  useEffect(() => {
    const scrollElement = catalogScrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      setShowTopFade(scrollElement.scrollTop > 0);

      if (loading || isLoadingNextPage || !hasNextPage) return;

      const distanceToBottom =
        scrollElement.scrollHeight -
        (scrollElement.scrollTop + scrollElement.clientHeight);
      if (distanceToBottom <= LOAD_MORE_THRESHOLD_PX) {
        void loadNextPage();
      }
    };

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [classes.length, hasNextPage, isLoadingNextPage, loadNextPage, loading]);

  const virtualizer = useVirtualizer({
    count: classes.length,
    getScrollElement: () => catalogScrollRef.current,
    estimateSize: () => 136,
    paddingStart: 0,
    paddingEnd: 12,
    gap: 12,
    overscan: 5,
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

  return (
    <div className={styles.root}>
      <div
        className={`${styles.topSection} ${showTopFade ? styles.topSectionScrolled : ""}`}
      >
        <Header />
        <div className={styles.recentlyViewedSection}>
          {showRecentlyViewed && (
            <div className={styles.recentlyViewed}>
              <div
                ref={recentlyViewedListRef}
                className={styles.recentlyViewedList}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleRecentlyViewedClasses.map((recentClass) => (
                    <motion.button
                      type="button"
                      className={styles.recentlyViewedTagButton}
                      key={`recent-${recentClass.key}`}
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
                        if (!recentClass.sessionId) return;
                        catalogScrollRef.current?.blur();
                        onSelect(
                          recentClass.subject,
                          recentClass.courseNumber,
                          recentClass.number,
                          recentClass.sessionId
                        );
                      }}
                    >
                      <span className={styles.recentlyViewedTagLabel}>
                        {recentClass.subject.slice(0, 4)}{" "}
                        {recentClass.courseNumber}
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
                {recentlyViewedEntries.map((recentClass) => (
                  <span
                    className={styles.recentlyViewedMeasureItem}
                    key={`recent-measure-${recentClass.key}`}
                  >
                    <span className={styles.recentlyViewedTagLabel}>
                      {recentClass.subject.slice(0, 4)}{" "}
                      {recentClass.courseNumber}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div ref={catalogScrollRef} className={styles.catalogScroll}>
        {!loading && classes.length === 0 ? (
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
                    class={adaptForClassCard(_class)}
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
        {isLoadingNextPage && (
          <div className={styles.loadMoreSkeletons} aria-hidden>
            <ClassCardSkeleton />
            <ClassCardSkeleton />
          </div>
        )}
      </div>
    </div>
  );
}
