import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client";
import { Search } from "iconoir-react";

import { LoadingIndicator } from "@repo/theme";

import { GET_COURSE_NAMES, GetCoursesResponse, ICourse } from "@/lib/api";
import { Recent, RecentType, getRecents } from "@/lib/recent";

import styles from "./CourseSearch.module.scss";
import { initialize } from "./browser";

interface CourseSearchProps {
  onSelect?: (course: ICourse) => void;
  onClear?: () => void;
  selectedCourse: ICourse | null;
  inputStyle?: React.CSSProperties;
}

export default function CourseSearch({
  onSelect,
  onClear,
  selectedCourse,
  inputStyle,
}: CourseSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [recentGrades, setRecentGrades] = useState<Recent<RecentType.Course>[]>(
    []
  );

  const { data, loading } = useQuery<GetCoursesResponse>(GET_COURSE_NAMES);

  const catalogCourses = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses; // no transformation
  }, [data]);

  const index = useMemo(() => initialize(catalogCourses), [catalogCourses]);
  const currentCourses = useMemo(() => {
    return searchQuery
      ? index
          // Limit query because Fuse performance decreases linearly by
          // n (field length) * m (pattern length) * l (maximum Levenshtein distance)
          .search(searchQuery.slice(0, 24))
          .map(({ refIndex }) => catalogCourses[refIndex])
      : catalogCourses;
  }, [catalogCourses, index, searchQuery]);

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

  useEffect(() => {
    if (!isOpen) return;

    setRecentGrades(getRecents(RecentType.Course));
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={styles.searchContainer}>
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Choose a class..."
          value={
            searchQuery ||
            (selectedCourse
              ? `${selectedCourse.subject} ${selectedCourse.number}`
              : "")
          }
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (onClear) onClear();
          }}
          style={inputStyle}
        />
      </div>

      {isOpen && (
        <div className={styles.dropdownPanel}>
          {loading ? (
            <LoadingIndicator className={styles.loading} size="md" />
          ) : (
            <div>
              <section className={styles.section}>
                <h2>RECENT</h2>
                {recentGrades.length > 0 && (
                  <div className={styles.recentCourses}>
                    {recentGrades.map((course, index) => (
                      <button
                        key={`grades-${course.subject}-${course.number}-${index}`}
                        className={styles.courseButton}
                        onClick={() => {
                          const full = data?.courses.find(
                            (c) =>
                              c.subject === course.subject &&
                              c.number === course.number
                          );
                          if (full) {
                            onSelect?.(full);
                            setSearchQuery("");
                          }
                          setIsOpen(false);
                        }}
                      >
                        {course.subject} {course.number}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <h2>CATALOG</h2>
                <div className={styles.catalogList}>
                  {currentCourses.map((course) => (
                    <button
                      key={`${course.subject}-${course.number}`}
                      className={styles.catalogItem}
                      onClick={() => {
                        onSelect?.(course);
                        setSearchQuery("");
                        setIsOpen(false);
                      }}
                    >
                      <span>
                        {course.subject} {course.number}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
