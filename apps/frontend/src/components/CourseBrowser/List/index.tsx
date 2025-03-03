import { useEffect, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { ArrowRight, FrameAltEmpty, Sparks } from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import { LoadingIndicator } from "@repo/theme";

import { ICourse } from "@/lib/api";

import Header from "../Header";
import Course from "./Course";
import styles from "./List.module.scss";

interface ListProps {
  currentCourses: ICourse[];
  onSelect: (course: ICourse) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  overlay: boolean;
  block: boolean;
  currentQuery: string;
  setCurrentQuery: (query: string) => void;
  persistent?: boolean;
  loading: boolean;
  showGrades: boolean;
}

export default function List({
  currentCourses,
  onSelect,
  open,
  overlay,
  block,
  onOpenChange,
  currentQuery,
  setCurrentQuery,
  persistent,
  loading,
  showGrades,
}: ListProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  const virtualizer = useVirtualizer({
    count: currentCourses.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 136,
    paddingStart: 72,
    paddingEnd: 72,
    gap: 12,
  });

  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
  }, [searchParams]);

  const items = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={rootRef}
      className={classNames(styles.root, {
        [styles.block]: block,
      })}
    >
      <div
        className={styles.view}
        style={{
          height: totalSize,
        }}
      >
        <Header
          currentCourses={currentCourses}
          currentQuery={currentQuery}
          open={open}
          overlay={overlay}
          autoFocus
          onOpenChange={onOpenChange}
          setCurrentQuery={setCurrentQuery}
          persistent={persistent}
        />
        {loading ? (
          <div className={styles.placeholder}>
            <LoadingIndicator size="lg" />
            <div className={styles.text}>
              <p className={styles.heading}>Fetching courses...</p>
              <p className={styles.description}>
                Search for, filter, and sort courses to narrow down your
                results.
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.placeholder}>
            <FrameAltEmpty width={32} height={32} />
            <div className={styles.text}>
              <p className={styles.heading}>No courses found</p>
              <p className={styles.description}>
                Find courses by broadening your search or entering a different
                query.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={styles.body}
            style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}
          >
            {items.map(({ key, index }) => {
              const course = currentCourses[index];

              return (
                <Course
                  {...course}
                  index={index}
                  key={key}
                  ref={virtualizer.measureElement}
                  onClick={() => onSelect(course)}
                  showGrades={showGrades}
                />
              );
            })}
          </div>
        )}
        <div className={styles.footer}>
          <Link to="/discover" className={styles.button}>
            <Sparks />
            <p className={styles.text}>Try discovering courses</p>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
