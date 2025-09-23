import { useEffect, useRef, useState } from "react";

import { Search } from "iconoir-react";

import { Badge, Color, LoadingIndicator } from "@repo/theme";

import { ICourse } from "@/lib/api";
import { Recent, RecentType, getRecents } from "@/lib/recent";
import { useCourseSearch } from "@/hooks/useCourseSearch";

import styles from "./CourseSearch.module.scss";

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

  const [recentCourses, setRecentCourses] = useState<
    Recent<RecentType.Course>[]
  >([]);

  const { 
    courses: catalogCourses, 
    filteredCourses: currentCourses, 
    searchQuery, 
    setSearchQuery, 
    loading 
  } = useCourseSearch({
    useFuzzySearch: true,
  });

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
                {recentCourses.length > 0 && (
                  <div className={styles.recentCourses}>
                    {recentCourses.map((course, index) => (
                      <Badge
                        key={`grades-${course.subject}-${course.number}-${index}`}
                        onClick={() => {
                          const full = catalogCourses.find(
                            (c: ICourse) =>
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
                )}
              </section>

              <section className={styles.section}>
                <h2>CATALOG</h2>
                <div className={styles.catalogList}>
                  {currentCourses.map((course: ICourse) => (
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
