import { useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import Fuse from "fuse.js";
import { Wind } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { ICatalogCourse, Semester } from "@/lib/api";
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

interface ECourse extends ICatalogCourse {
  expanded: boolean;
}

interface ListProps {
  courses: ICatalogCourse[];
  currentSemester: Semester;
  currentYear: number;
}

export default function List({
  courses,
  currentSemester,
  currentYear,
}: ListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  // Note: The combined name property will be included in filteredCourses
  const [filteredCourses, setFilteredCourses] = useState<ECourse[]>([]);

  const query = useMemo(() => searchParams.get("query"), [searchParams]);

  const fuse = useMemo(() => initializeFuse(courses), [courses]);

  const virtualizer = useVirtualizer({
    count: filteredCourses.length,
    getScrollElement: () => ref.current,
    estimateSize: () => 136,
    paddingStart: 12,
  });

  const setExpanded = (index: number, expanded: boolean) => {
    setFilteredCourses((filteredCourses) => {
      const _filteredCourses = structuredClone(filteredCourses);
      _filteredCourses[index].expanded = expanded;
      return _filteredCourses;
    });
  };

  useEffect(() => {
    const _filteredCourses = query
      ? fuse.search(query).map(({ refIndex: index }) => ({
          ...courses[index],
          expanded: false,
        }))
      : courses.map((course) => ({ ...course, expanded: false }));

    setFilteredCourses(_filteredCourses);
  }, [query, fuse, courses]);

  const items = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  return (
    <div className={styles.root} ref={ref}>
      {items.length === 0 ? (
        <div className={styles.empty}>
          <Wind width={32} height={32} />
          <div className={styles.text}>
            <p className={styles.heading}>No courses found</p>
            <p className={styles.description}>
              Unfortunately, no courses could be found matching your search.
              Please try again with a different query.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={styles.view}
          style={{
            height: totalSize,
          }}
        >
          <div
            className={styles.body}
            style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}
          >
            {items.map(({ key, index }) => (
              <Course
                {...filteredCourses[index]}
                semester={currentSemester}
                year={currentYear}
                data-index={index}
                key={key}
                ref={virtualizer.measureElement}
                setExpanded={(expanded) => setExpanded(index, expanded)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
