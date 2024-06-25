import { useEffect, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { ArrowRight, FrameAltEmpty, Sparks } from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import LoadingIndicator from "@/components/LoadingIndicator";
import { ICourse, Semester } from "@/lib/api";

import Header from "../Header";
import Course from "./Course";
import styles from "./List.module.scss";

interface ListProps {
  currentCourses: ICourse[];
  onClassSelect: (course: ICourse, number: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  overlay: boolean;
  block: boolean;
  currentSemester: Semester;
  currentYear: number;
  currentQuery: string;
  expandedCourses: boolean[];
  setExpanded: (index: number, expanded: boolean) => void;
  setCurrentQuery: (query: string) => void;
  persistent?: boolean;
  loading: boolean;
}

export default function List({
  currentCourses: currentCourses,
  onClassSelect,
  currentSemester,
  currentYear,
  open,
  overlay,
  block,
  onOpenChange,
  currentQuery,
  expandedCourses,
  setExpanded,
  setCurrentQuery,
  persistent,
  loading,
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
          currentSemester={currentSemester}
          currentYear={currentYear}
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
            <LoadingIndicator size={32} />
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
                  expanded={expandedCourses[index]}
                  setExpanded={(expanded) => setExpanded(index, expanded)}
                  onClassSelect={(number) => onClassSelect(course, number)}
                />
              );
            })}
          </div>
        )}
        <div className={styles.footer}>
          <Link to="/explore" className={styles.button}>
            <Sparks />
            <p className={styles.text}>Try exploring courses</p>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
