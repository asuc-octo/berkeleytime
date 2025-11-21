import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client/react";
import { Search } from "iconoir-react";

import { Badge, Color, LoadingIndicator } from "@repo/theme";

import { ICourse } from "@/lib/api";
import { GetCourseNamesDocument } from "@/lib/generated/graphql";
import { Recent, RecentType, getRecents } from "@/lib/recent";

import styles from "./CourseSearch.module.scss";
import { initialize } from "./browser";

interface CourseSearchProps {
  onSelect?: (course: Pick<ICourse, "subject" | "number">) => void;
  onClear?: () => void;
  selectedCourse: ICourse | null;
  inputStyle?: React.CSSProperties;
  minimal?: boolean;
  ratedCourses?: Array<{ subject: string; courseNumber: string }>;
}

export default function CourseSearch({
  onSelect,
  onClear,
  selectedCourse,
  inputStyle,
  minimal = false,
  ratedCourses = [],
}: CourseSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [recentCourses, setRecentCourses] = useState<
    Recent<RecentType.Course>[]
  >([]);

  const { data, loading } = useQuery(GetCourseNamesDocument);

  const catalogCourses = useMemo(() => {
    if (!data?.courses) return [];

    // Deduplicate: keep course with highest courseId for each subject-number
    // Not ideal behavior. This only happen if data is wrong.
    const seen = new Map<string, (typeof data.courses)[0]>();
    for (const course of data.courses) {
      const key = `${course.subject}-${course.number}`;
      const existing = seen.get(key);
      if (!existing || course.courseId > existing.courseId) {
        seen.set(key, course);
      }
    }

    if (seen.size < data.courses.length) {
      console.error(
        `[CourseSearch] Deduplicated ${data.courses.length - seen.size} duplicate courses`
      );
    }

    return Array.from(seen.values());
  }, [data]);

  const index = useMemo(() => initialize(catalogCourses), [catalogCourses]);
  const currentCourses = useMemo(() => {
    if (!searchQuery) return catalogCourses.slice(0, 50);

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

  useEffect(() => {
    if (selectedCourse && !isOpen) {
      setSearchQuery("");
    }
  }, [selectedCourse, isOpen]);

  const isCourseRated = (subject: string, number: string) => {
    return ratedCourses.some(
      (rated) => rated.subject === subject && rated.courseNumber === number
    );
  };

  const handleFocus = () => {
    if (!searchQuery && selectedCourse) {
      setSearchQuery(`${selectedCourse.subject} ${selectedCourse.number}`);
    }
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
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
          onFocus={handleFocus}
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
              {!minimal && recentCourses.length > 0 && (
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
                        color={Color.Zinc}
                        style={{
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {currentCourses.length > 0 && (
                <section
                  className={styles.section}
                  style={minimal ? { paddingTop: 0 } : undefined}
                >
                  {!minimal && <h2>CATALOG</h2>}
                  <div className={styles.catalogList}>
                    {currentCourses.map((course) => {
                      const isRated = isCourseRated(
                        course.subject,
                        course.number
                      );
                      return (
                        <button
                          key={course.courseId}
                          className={`${styles.catalogItem} ${isRated ? styles.ratedItem : ""}`}
                          onClick={() => {
                            if (!isRated) {
                              onSelect?.(course);
                              setSearchQuery("");
                              setIsOpen(false);
                            }
                          }}
                          disabled={isRated}
                        >
                          <span>
                            {course.subject} {course.number}
                            {isRated && (
                              <span className={styles.ratedLabel}>
                                {" "}
                                (Rated)
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                    {!searchQuery && catalogCourses.length > 50 && (
                      <div className={styles.moreCoursesHint}>
                        +{catalogCourses.length - 50} more courses. Search and
                        narrow results.
                      </div>
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
