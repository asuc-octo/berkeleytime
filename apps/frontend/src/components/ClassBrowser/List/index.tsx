import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { EmptyPage } from "iconoir-react";

import ClassCard from "@/components/ClassCard";
import ClassCardSkeleton from "@/components/ClassCard/Skeleton";
import { useTracking } from "@/hooks/api/tracking/useTracking";
import { ICatalogClassServer } from "@/lib/api/catalog";

import Header from "../Header";
import { useLayoutContext } from "../context/LayoutContext";
import { useListContext } from "../context/ListContext";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./List.module.scss";

const getPnpPercentage = (_class: ICatalogClassServer): number | null => {
  const passCount = _class.allTimePassCount ?? 0;
  const noPassCount = _class.allTimeNoPassCount ?? 0;
  const totalCount = passCount + noPassCount;
  if (totalCount <= 0) return null;
  return passCount / totalCount;
};

// Adapt ICatalogClassServer to the shape ClassCard expects
const adaptForClassCard = (_class: ICatalogClassServer) => {
  const pnpPercentage = getPnpPercentage(_class);

  return {
    subject: _class.subject,
    courseNumber: _class.courseNumber,
    number: _class.number,
    title: _class.title ?? _class.courseTitle,
    unitsMax: _class.unitsMax,
    unitsMin: _class.unitsMin,
    decal: _class.decal,
    course: {
      title: _class.courseTitle,
      gradeDistribution:
        _class.allTimeAverageGrade != null || pnpPercentage != null
          ? {
              average: _class.allTimeAverageGrade,
              pnpPercentage,
            }
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
  };
};

interface ListProps {
  onSelect: (
    subject: string,
    courseNumber: string,
    number: string,
    sessionId: string
  ) => void;
}

const LOAD_MORE_THRESHOLD_PX = 320;

export default function List({ onSelect }: ListProps) {
  const { classes, loading, hasNextPage, loadNextPage, isLoadingNextPage } =
    useListContext();

  const { aiSearchActive, query } = useLayoutContext();
  const { trackEvent } = useTracking();

  const [showTopFade, setShowTopFade] = useState(false);

  const catalogScrollRef = useRef<HTMLDivElement>(null);

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
    paddingEnd: 10,
    gap: 10,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  const handleClassClick = (index: number) => {
    const selected = classes[index];
    if (!selected) return;
    trackEvent(
      "course_result_clicked",
      "class",
      `${selected.subject}-${selected.courseNumber}`,
      {
        position: index,
        query: query || null,
        aiSearch: aiSearchActive,
      }
    );
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
      </div>
      <div ref={catalogScrollRef} className={styles.catalogScroll}>
        {loading && classes.length === 0 ? (
          <div className={styles.skeletonContainer}>
            {[...Array(10)].map((_, i) => (
              <ClassCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : !loading && classes.length === 0 ? (
          <div className={styles.placeholder}>
            <EmptyPage width={32} height={32} />
            <p className={styles.heading}>No classes found</p>
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
            <ClassCardSkeleton />
          </div>
        )}
      </div>
    </div>
  );
}
