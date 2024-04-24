import { Dispatch, SetStateAction, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import {
  ArrowRight,
  Filter,
  FilterSolid,
  FrameAltEmpty,
  Sparks,
} from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import IconButton from "@/components/IconButton";
import { ICatalogCourse, Semester } from "@/lib/api";

import Course from "./Course";
import styles from "./List.module.scss";

interface ListProps {
  currentCourses: ICatalogCourse[];
  onClassSelect: (course: ICatalogCourse, number: string) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  overlay: boolean;
  block: boolean;
  currentSemester: Semester;
  currentYear: number;
  currentQuery: string;
  expandedCourses: boolean[];
  setExpanded: (index: number, expanded: boolean) => void;
}

export default function List({
  currentCourses,
  onClassSelect,
  currentSemester,
  currentYear,
  open,
  overlay,
  block,
  setOpen,
  currentQuery,
  expandedCourses,
  setExpanded,
}: ListProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const virtualizer = useVirtualizer({
    count: currentCourses.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 136,
    paddingStart: 72,
    paddingEnd: 60,
  });

  const handleQueryChange = (value: string) => {
    if (value) searchParams.set("query", value);
    else searchParams.delete("query");
    setSearchParams(searchParams);

    rootRef.current?.scrollTo({ top: 0 });
  };

  const items = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      className={classNames(styles.root, {
        [styles.block]: block,
        [styles.overlay]: overlay,
      })}
      ref={rootRef}
    >
      <div
        className={styles.view}
        style={{
          height: totalSize,
        }}
      >
        <div className={styles.header}>
          <div className={styles.form}>
            <input
              className={styles.input}
              type="text"
              autoFocus
              value={currentQuery}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder={`Search ${currentSemester} ${currentYear} courses...`}
            />
            <div className={styles.label}>
              {currentCourses.length.toLocaleString()}
            </div>
            {overlay && (
              <IconButton onClick={() => setOpen(!open)}>
                {open ? <FilterSolid /> : <Filter />}
              </IconButton>
            )}
          </div>
        </div>
        {items.length === 0 ? (
          <div className={styles.placeholder}>
            <FrameAltEmpty width={32} height={32} />
            <div className={styles.text}>
              <p className={styles.heading}>No courses found</p>
              <p className={styles.description}>
                Find more courses by broadening your search or entering a
                different query.
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
