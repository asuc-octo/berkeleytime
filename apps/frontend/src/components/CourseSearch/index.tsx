import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client/react";
import { Search } from "iconoir-react";

import { Badge, Color, LoadingIndicator } from "@repo/theme";

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

  const [recentCourses, setRecentCourses] = useState<
    Recent<RecentType.Course>[]
  >([]);

  const { data, loading } = useQuery<GetCoursesResponse>(GET_COURSE_NAMES);

  const catalogCourses = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses; // no transformation
  }, [data]);

  const index = useMemo(() => initialize(catalogCourses), [catalogCourses]);
  const currentCourses = useMemo(() => {
    // Don't search until user types at least 2 characters
    if (!searchQuery || searchQuery.length < 2) return [];
    
    return index
      .search(searchQuery.slice(0, 24))
      .slice(0, 50) // Limit to first 50 results for performance
      .map(({ refIndex }) => catalogCourses[refIndex]);
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

    setRecentCourses(getRecents(RecentType.Course));
  }, [isOpen]);

  return (
    <div ref={wrapperRef}>
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
              {recentCourses.length > 0 && (
                <section className={styles.section}>
                  <h2>RECENT</h2>
                  <div className={styles.recentCourses}>
                    {recentCourses.map((course, index) => (
                      <Badge
                        key={`grades-${course.subject}-${course.number}-${index}`}
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
                        label={`${course.subject} ${course.number}`}
                        color={Color.zinc}
                        style={{
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {searchQuery && searchQuery.length >= 2 && (
                <section className={styles.section}>
                  <h2>CATALOG</h2>
                  <div className={styles.catalogList}>
                    {currentCourses.length === 0 ? (
                      <div style={{ padding: '12px', color: 'var(--paragraph-color)' }}>
                        No courses found
                      </div>
                    ) : (
                      currentCourses.map((course) => (
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
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
