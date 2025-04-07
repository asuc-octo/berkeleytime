import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client";
import { Search } from "iconoir-react";
import { SingleValue } from "react-select";

import { GET_COURSES, GetCoursesResponse, ICourse, Semester } from "@/lib/api";
import { getRecentClasses, getRecentGrades } from "@/lib/recent";

import styles from "./CourseSearch.module.scss";

interface CourseSearchProps {
  onSelect?: (course: ICourse) => void;
  onClear?: () => void;
  selectedCourse?: { subject: string; courseNumber: string };
}

type CourseOptionType = {
  value: ICourse;
  label: string;
};

type OptionType = {
  value: string;
  label: string;
};

interface SelectedCourse {
  subject: string;
  courseNumber: string;
  year?: number;
  semester?: Semester;
  givenName?: string;
  familyName?: string;
}

export default function CourseSearch({ onSelect, onClear }: CourseSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [recentGrades, setRecentGrades] = useState<
    ReturnType<typeof getRecentGrades>
  >([]);
  const { data } = useQuery<GetCoursesResponse>(GET_COURSES);

  const catalogCourses = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses; // no transformation
  }, [data]);

  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

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
    if (isOpen) {
      setRecentGrades(getRecentGrades());
    }
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
            setSelectedCourse(null);
            if (onClear) onClear();
          }}
        />
      </div>

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
                    onClick={() => {
                      const full = data?.courses.find(
                        (c) =>
                          c.subject === course.subject &&
                          c.number === course.courseNumber
                      );
                      if (full) {
                        onSelect?.(full);
                        setSelectedCourse(full);
                        setSearchQuery("");
                      }
                      setIsOpen(false);
                    }}
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
                  `${course.subject} ${course.number} ${course.title}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((course) => (
                  <button
                    key={`${course.subject}-${course.number}`}
                    className={styles.catalogItem}
                    onClick={() => {
                      onSelect?.(course);
                      setSelectedCourse(course);
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
  );
}
