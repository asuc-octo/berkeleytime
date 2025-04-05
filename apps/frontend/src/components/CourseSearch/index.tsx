import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client";

import { GET_COURSES, GetCoursesResponse } from "@/lib/api";
import { getRecentClasses, getRecentGrades } from "@/lib/recent";

import styles from "./CourseSearch.module.scss";

interface CourseSearchProps {
  onSelect?: (course: { subject: string; courseNumber: string }) => void;
}

export default function CourseSearch({ onSelect }: CourseSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const recentGrades = useMemo(() => getRecentGrades(), []);
  const { data } = useQuery<GetCoursesResponse>(GET_COURSES);

  const catalogCourses = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses.map((course) => ({
      subject: course.subject,
      courseNumber: course.number,
      title: course.title,
    }));
  }, [data]);

  const handleCourseClick = (subject: string, courseNumber: string) => {
    if (onSelect) {
      onSelect({ subject, courseNumber });
    }
    setIsOpen(false); // Close dropdown on selection
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.container}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search courses..."
        value={searchQuery}
        onFocus={() => setIsOpen(true)}
        onClick={() => setIsOpen(true)}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {isOpen && (
        <div className={styles.dropdownPanel}>
          <section className={styles.section}>
            <h2>RECENT</h2>
            {recentGrades.length > 0 && (
              <div className={styles.recentCourses}>
                {recentGrades.slice(0, 5).map((course, index) => (
                  <button
                    key={`grades-${course.subject}-${course.courseNumber}-${index}`}
                    className={styles.courseButton}
                    onClick={() =>
                      handleCourseClick(course.subject, course.courseNumber)
                    }
                  >
                    {course.subject} {course.courseNumber}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2>CATALOG</h2>
            <div className={styles.catalogList}>
              {catalogCourses
                .filter((course) =>
                  `${course.subject} ${course.courseNumber} ${course.title}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((course, index) => (
                  <button
                    key={`${course.subject}-${course.courseNumber}-${index}`}
                    className={styles.catalogItem}
                    onClick={() =>
                      handleCourseClick(course.subject, course.courseNumber)
                    }
                  >
                    <span>
                      {course.subject} {course.courseNumber}
                    </span>
                  </button>
                ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
