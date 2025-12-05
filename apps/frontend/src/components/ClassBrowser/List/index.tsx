import { useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { FrameAltEmpty } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import ClassCard from "@/components/ClassCard";
import ClassCardSkeleton from "@/components/ClassCard/Skeleton";
import { RecentType, getRecents } from "@/lib/recent";

import Header from "../Header";
import useBrowser from "../useBrowser";
import styles from "./List.module.scss";

interface ListProps {
  onSelect: (subject: string, courseNumber: string, number: string) => void;
}

export default function List({ onSelect }: ListProps) {
  const { classes, loading, year, semester, query } = useBrowser();
  const [recentlyViewedVersion, setRecentlyViewedVersion] = useState(0);
  const [searchParams] = useSearchParams();

  const rootRef = useRef<HTMLDivElement>(null);
  const recentlyViewedSectionRef = useRef<HTMLDivElement>(null);

  const isAutoScroll = searchParams.get("autoscroll") === "true";

  const recentlyViewed = useMemo(() => {
    const allRecents = getRecents(RecentType.Class);
    return allRecents
      .filter((recent) => recent.year === year && recent.semester === semester)
      .slice(0, 3);
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
    if (!isAutoScroll || !rootRef.current) return;

    let animationId: number;
    let lastTime = performance.now();
    let accumulatedScroll = 0;
    const speed = 30; // pixels per second

    const animate = (currentTime: number) => {
      const el = rootRef.current;
      if (!el) return;

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      accumulatedScroll += speed * deltaTime;

      // Only apply scroll when we have at least 1 pixel (avoids rounding jitter)
      if (accumulatedScroll >= 1) {
        const scrollAmount = Math.floor(accumulatedScroll);
        accumulatedScroll -= scrollAmount;

        if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
          el.scrollTop = 0;
        } else {
          el.scrollTop += scrollAmount;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isAutoScroll]);

  const virtualizer = useVirtualizer({
    count: classes.length,
    getScrollElement: () => rootRef.current,
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
    onSelect(selected.subject, selected.courseNumber, selected.number);
  };

  const isLoading = loading && classes.length === 0;

  return (
    <div
      ref={rootRef}
      className={classNames(styles.root, { [styles.autoScroll]: isAutoScroll })}
      style={isLoading ? { overflow: "hidden" } : undefined}
    >
      <Header />
      <div
        ref={recentlyViewedSectionRef}
        className={styles.recentlyViewedSection}
      >
        {showRecentlyViewed && (
          <div className={styles.recentlyViewed}>
            <p className={styles.sectionTitle}>RECENTLY VIEWED</p>
            <div className={styles.recentlyViewedList}>
              {recentlyViewedClasses.map((_class) => (
                <ClassCard
                  class={_class}
                  key={`recent-${_class.subject}-${_class.courseNumber}-${_class.number}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    rootRef.current?.blur();
                    onSelect(
                      _class.subject,
                      _class.courseNumber,
                      _class.number
                    );
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <p className={styles.catalogTitle}>CATALOG</p>
      </div>
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
