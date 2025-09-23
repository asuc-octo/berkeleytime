import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import Fuse from "fuse.js";

import { GET_COURSE_NAMES, GetCoursesResponse, ICourse } from "@/lib/api";
import { subjects } from "@/lib/course";

interface UseCourseSearchOptions {
  /**
   * Whether to skip the GraphQL query (useful for conditional loading)
   */
  skip?: boolean;
  /**
   * Custom transformation function to convert ICourse to desired format
   */
  transform?: (course: ICourse) => any;
  /**
   * Whether to use fuzzy search (Fuse.js) or simple string matching
   */
  useFuzzySearch?: boolean;
}

interface UseCourseSearchReturn {
  /**
   * All available courses
   */
  courses: any[];
  /**
   * Filtered courses based on search query
   */
  filteredCourses: any[];
  /**
   * Current search query
   */
  searchQuery: string;
  /**
   * Set the search query
   */
  setSearchQuery: (query: string) => void;
  /**
   * Whether the GraphQL query is loading
   */
  loading: boolean;
  /**
   * GraphQL query error
   */
  error: any;
  /**
   * Fuse.js search index (only available when useFuzzySearch is true)
   */
  searchIndex?: Fuse<any>;
}

const initializeFuseIndex = (courses: ICourse[]) => {
  const list = courses.map((course) => {
    const { subject, number } = course;

    // For prefixed courses, prefer the number and add an abbreviation with the prefix
    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const term = subject.toLowerCase();

    const alternateNames = subjects[term]?.abbreviations?.reduce(
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
        : [`${subject}${number}`]
    ) || (containsPrefix
      ? [
          `${subject}${number}`,
          `${subject} ${alternateNumber}`,
          `${subject}${alternateNumber}`,
        ]
      : [`${subject}${number}`]);

    return {
      ...course,
      name: `${subject} ${number}`,
      alternateNames,
    };
  });

  const options = {
    includeScore: true,
    threshold: 0.25,
    keys: [
      "name",
      "title",
      {
        name: "alternateNames",
        weight: 2,
      },
    ],
  };

  return new Fuse(list, options);
};

export function useCourseSearch({
  skip = false,
  transform,
  useFuzzySearch = true,
}: UseCourseSearchOptions = {}): UseCourseSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, error } = useQuery<GetCoursesResponse>(GET_COURSE_NAMES, {
    skip,
  });

  const courses = useMemo(() => {
    if (!data?.courses) return [];
    
    const rawCourses = data.courses;
    
    if (transform) {
      return rawCourses.map(transform);
    }
    
    return rawCourses;
  }, [data, transform]);

  const searchIndex = useMemo(() => {
    if (!useFuzzySearch || !data?.courses) return undefined;
    
    const coursesForIndex = transform ? courses : data.courses;
    return initializeFuseIndex(coursesForIndex as ICourse[]);
  }, [courses, data?.courses, useFuzzySearch, transform]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses;
    }

    if (useFuzzySearch && searchIndex) {
      // Use Fuse.js for fuzzy search
      return searchIndex
        .search(searchQuery.slice(0, 24)) // Limit query length for performance
        .map(({ refIndex }) => courses[refIndex]);
    } else {
      // Use simple string matching
      const query = searchQuery.toLowerCase();
      return courses.filter((course: any) => {
        const searchableText = `${course.subject || ''} ${course.number || ''} ${course.name || ''} ${course.title || ''}`.toLowerCase();
        return searchableText.includes(query);
      });
    }
  }, [courses, searchQuery, useFuzzySearch, searchIndex]);

  return {
    courses,
    filteredCourses,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    searchIndex,
  };
}
