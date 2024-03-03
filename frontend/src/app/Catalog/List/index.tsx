import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

// import Fuse from "fuse.js";
import Boundary from "@/components/Boundary";
import { ICatalogCourse, Semester } from "@/lib/api";

import Course from "./Course";
import styles from "./List.module.scss";

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

  const [filteredCourses, setFilteredCourses] = useState<ECourse[]>([]);

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
    /*const options = {
      includeScore: true,
      keys: ["author.tags.value"],
    };

    const fuse = new Fuse(courses, options);

    const result = fuse.search(query);*/

    setFilteredCourses(
      courses.map((course) => ({
        ...course,
        expanded: false,
      }))
    );
  }, [courses]);

  const items = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  return (
    <div className={styles.root} ref={ref}>
      {courses.length === 0 ? (
        <Boundary>Wow</Boundary>
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
