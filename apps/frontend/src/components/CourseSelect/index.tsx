import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";

import { SearchableSelect } from "@repo/theme";
import type { Option } from "@repo/theme";

import { ICourse } from "@/lib/api";
import { GetCourseNamesDocument } from "@/lib/generated/graphql";
import { Recent, RecentType, getRecents } from "@/lib/recent";

import { initialize } from "../CourseSearch/browser";

interface CourseSelectProps {
  onSelect?: (course: Pick<ICourse, "subject" | "number">) => void;
  onClear?: () => void;
  selectedCourse: ICourse | null;
  minimal?: boolean;
  ratedCourses?: Array<{ subject: string; courseNumber: string }>;
}

type CourseOption = Pick<ICourse, "subject" | "number" | "courseId">;

export default function CourseSelect({
  onSelect,
  onClear,
  selectedCourse,
  minimal = false,
  ratedCourses = [],
}: CourseSelectProps) {
  const { data, loading } = useQuery(GetCourseNamesDocument);

  const [recentCourses, setRecentCourses] = useState<
    Recent<RecentType.Course>[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Deduplicate courses: keep course with highest courseId for each subject-number
  const catalogCourses = useMemo(() => {
    if (!data?.courses) return [];

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
        `[CourseSelect] Deduplicated ${data.courses.length - seen.size} duplicate courses`
      );
    }

    return Array.from(seen.values());
  }, [data]);

  // Initialize fuzzy search index
  const index = useMemo(() => initialize(catalogCourses), [catalogCourses]);

  // Load recent courses on mount
  useEffect(() => {
    setRecentCourses(getRecents(RecentType.Course));
  }, []);

  // Check if a course is rated
  const isCourseRated = (subject: string, number: string) => {
    return ratedCourses.some(
      (rated) => rated.subject === subject && rated.courseNumber === number
    );
  };

  // Build options dynamically based on search query
  const options = useMemo(() => {
    const courseToOptionValue = (course: {
      subject: string;
      number: string;
      courseId: string;
    }): CourseOption => ({
      subject: course.subject,
      number: course.number,
      courseId: course.courseId,
    });

    const opts: Option<CourseOption>[] = [];

    // If there's a search query, use fuzzy search
    if (searchQuery && searchQuery.trim() !== "") {
      console.log(
        `[CourseSelect] Searching ${catalogCourses.length} courses for "${searchQuery}"`
      );
      const searchResults = index
        .search(searchQuery.slice(0, 24))
        .slice(0, 50)
        .map(({ refIndex }) => catalogCourses[refIndex]);

      console.log(`[CourseSelect] Found ${searchResults.length} results`);

      for (const course of searchResults) {
        const isRated = isCourseRated(course.subject, course.number);
        const optionValue = courseToOptionValue(course);
        opts.push({
          value: optionValue,
          label: `${course.subject} ${course.number}`,
          meta: isRated ? "Rated" : undefined,
          disabled: isRated,
        });
      }

      return opts;
    }

    // No search: show recent + first 20 catalog courses for performance
    if (!minimal && recentCourses.length > 0) {
      opts.push({ type: "label", label: "Recent" });

      for (const recent of recentCourses) {
        const full = catalogCourses.find(
          (c) => c.subject === recent.subject && c.number === recent.number
        );
        if (full) {
          const isRated = isCourseRated(full.subject, full.number);
          const optionValue = courseToOptionValue(full);
          opts.push({
            value: optionValue,
            label: `${full.subject} ${full.number}`,
            meta: isRated ? "Rated" : undefined,
            disabled: isRated,
          });
        }
      }
    }

    // Add catalog courses group (limited to first 20 for performance)
    opts.push({ type: "label", label: minimal ? "" : "Catalog" });

    const limitedCourses = catalogCourses.slice(0, 20);
    for (const course of limitedCourses) {
      const isRated = isCourseRated(course.subject, course.number);
      const optionValue = courseToOptionValue(course);
      opts.push({
        value: optionValue,
        label: `${course.subject} ${course.number}`,
        meta: isRated ? "Rated" : undefined,
        disabled: isRated,
      });
    }

    return opts;
  }, [catalogCourses, recentCourses, minimal, ratedCourses, searchQuery, index]);

  // Convert selected course to value format
  const value = selectedCourse
    ? ({
        subject: selectedCourse.subject,
        number: selectedCourse.number,
        courseId: selectedCourse.courseId,
      } as CourseOption)
    : null;

  return (
    <SearchableSelect<CourseOption>
      options={options}
      value={value}
      onChange={(newValue) => {
        if (newValue && !Array.isArray(newValue)) {
          onSelect?.(newValue as CourseOption);
        } else {
          onClear?.();
        }
      }}
      placeholder="Choose a class..."
      searchPlaceholder="Search..."
      emptyMessage="No courses found."
      clearable={true}
      disabled={loading}
      onSearchChange={setSearchQuery}
    />
  );
}
