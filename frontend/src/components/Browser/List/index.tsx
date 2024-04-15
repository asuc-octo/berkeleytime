import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import Fuse from "fuse.js";
import { Filter, FilterSolid, Xmark } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import IconButton from "@/components/IconButton";
import { ICatalogCourse } from "@/lib/api";
import { subjects } from "@/lib/course";

import Course from "./Course";
import styles from "./List.module.scss";

const initializeFuse = (courses: ICatalogCourse[]) => {
  const list = courses.map((course) => {
    const { title, subject, number, classes } = course;

    // For courses like W54, prefer the number and add an abbreviation
    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const term = subject.toLowerCase();

    const alternateNames = subjects[term]?.abbreviations.reduce(
      (acc, abbreviation) => {
        // Add alternate names for abbreviations
        const abbreviations = [
          `${abbreviation}${number}`,
          `${abbreviation} ${number}`,
        ];

        if (containsPrefix) {
          abbreviations.push(
            `${abbreviation}${alternateNumber}`,
            `${abbreviation} ${alternateNumber}`
          );
        }

        return [...acc, ...abbreviations];
      },
      // Add alternate names
      containsPrefix
        ? [
            `${subject}${number}`,
            `${subject} ${alternateNumber}`,
            `${subject}${alternateNumber}`,
          ]
        : []
    );

    return {
      title,
      subject,
      number,
      name: `${subject} ${number}`,
      alternateNames,
      classes,
    };
  });

  const options = {
    includeScore: true,
    shouldSort: true,
    findAllMatches: true,
    threshold: 0.25,
    keys: [
      { name: "number", weight: 1.2 },
      "name",
      "title",
      "classes.title",
      {
        name: "alternateNames",
        weight: 2,
      },
      { name: "subject", weight: 1.5 },
    ],
    // Fuse types are wrong for sortFn
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortFn: (a: any, b: any) => {
      // First, sort by score
      if (a.score - b.score) return a.score - b.score;

      // Otherwise, sort by number
      return a.item[0].v.toLowerCase().localeCompare(b.item[0].v.toLowerCase());
    },
  };

  return new Fuse(list, options);
};

interface ListProps {
  courses: ICatalogCourse[];
  setClass: (course: ICatalogCourse, number: string) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  responsive: boolean;
  block?: boolean;
}

export default function List({
  courses,
  setClass,
  open,
  responsive,
  block,
  setOpen,
}: ListProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentQuery = useMemo(
    () => searchParams.get("query") ?? "",
    [searchParams]
  );

  // Note: The combined name (subject + number) property will be included in filteredCourses
  const [filteredCourses, setFilteredCourses] = useState<ICatalogCourse[]>([]);

  const [expandedCourses, setExpandedCourses] = useState<boolean[]>([]);

  const fuse = useMemo(() => initializeFuse(courses), [courses]);

  const virtualizer = useVirtualizer({
    count: filteredCourses.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 136,
    paddingStart: 72,
  });

  const setExpanded = (index: number, expanded: boolean) => {
    setExpandedCourses((expandedCourses) => {
      const _expandedCourses = structuredClone(expandedCourses);
      _expandedCourses[index] = expanded;
      return _expandedCourses;
    });
  };

  const handleQueryChange = (value: string) => {
    if (value) searchParams.set("query", value);
    else searchParams.delete("query");
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const _filteredCourses = currentQuery
      ? fuse.search(currentQuery).map(({ refIndex }) => courses[refIndex])
      : courses;

    setFilteredCourses(_filteredCourses);

    // Close courses when filtered courses change
    setExpandedCourses(new Array(_filteredCourses.length).fill(false));
  }, [currentQuery, fuse, courses]);

  const items = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      className={classNames(styles.root, {
        [styles.block]: block,
        [styles.responsive]: responsive,
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
          <div className={styles.group}>
            <input
              className={styles.input}
              type="text"
              autoFocus
              value={currentQuery}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search Spring 2024 courses..."
            />
            <div className={styles.count}>
              {filteredCourses.length.toLocaleString()}
            </div>
            {responsive && (
              <IconButton onClick={() => setOpen(!open)}>
                {open ? <FilterSolid /> : <Filter />}
              </IconButton>
            )}
          </div>
        </div>
        {items.length === 0 ? (
          <div className={styles.placeholder}>
            <Xmark width={32} height={32} />
            <div className={styles.text}>
              <p className={styles.heading}>No courses found</p>
              <p className={styles.description}>
                Try again with a different query or by broadening your search.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={styles.body}
            style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}
          >
            {items.map(({ key, index }) => {
              const course = filteredCourses[index];

              return (
                <Course
                  {...course}
                  data-index={index}
                  key={key}
                  ref={virtualizer.measureElement}
                  expanded={expandedCourses[index]}
                  setExpanded={(expanded) => setExpanded(index, expanded)}
                  setClass={(number) => setClass(course, number)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
