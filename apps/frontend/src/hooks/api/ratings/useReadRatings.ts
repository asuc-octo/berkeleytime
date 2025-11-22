import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import { ReadAllRatingsDataDocument, Semester } from "@/lib/generated/graphql";

interface UseReadRatingsOptions {
  subject: string;
  courseNumber: string;
}

/**
 * Hook to fetch all ratings-related data for a course in a single query.
 * Eliminates flashing by loading all data upfront in one network request.
 * Follows the same pattern as useReadClassEnrollment, useReadCourseGrades, etc.
 */
export const useReadRatings = ({
  subject,
  courseNumber,
}: UseReadRatingsOptions) => {
  // Single consolidated query - fetches everything in one network request
  const { data, loading, error, refetch } = useQuery(
    ReadAllRatingsDataDocument,
    {
      variables: {
        subject,
        courseNumber,
        courseNumberTyped: courseNumber, // Same value, different type for GraphQL
      },
      fetchPolicy: "cache-first",
    }
  );

  // Derived state with useMemo
  const courseClasses = useMemo(
    () =>
      data?.course?.classes?.filter(
        (courseClass): courseClass is NonNullable<typeof courseClass> =>
          Boolean(courseClass)
      ) ?? [],
    [data?.course?.classes]
  );

  const semestersWithRatings = useMemo(() => {
    if (!data?.semestersWithRatings) return [];
    return data.semestersWithRatings.filter((sem) => sem.maxMetricCount > 0);
  }, [data?.semestersWithRatings]);

  const userRatings = useMemo(() => {
    if (!data?.userRatings?.classes) return null;

    const matchedRating = data.userRatings.classes.find(
      (classRating: {
        subject: string;
        courseNumber: string;
        semester: Semester;
        year: number;
        classNumber: string;
      }) =>
        classRating.subject === subject &&
        classRating.courseNumber === courseNumber
    );
    return matchedRating ?? null;
  }, [data?.userRatings?.classes, subject, courseNumber]);

  const hasRatings = useMemo(() => {
    const metrics =
      data?.course?.aggregatedRatings?.metrics?.filter((metric) =>
        Boolean(metric)
      ) ?? [];
    const totalRatings = metrics.reduce(
      (total, metric) => total + (metric.count ?? 0),
      0
    );
    return totalRatings > 0;
  }, [data?.course?.aggregatedRatings?.metrics]);

  return {
    // All user ratings data (for checking constraints)
    userRatingsData: data?.userRatings
      ? { userRatings: data.userRatings }
      : undefined,
    // User's rating for this specific course
    userRatings,
    // Aggregated ratings for the course
    aggregatedRatings: data?.course?.aggregatedRatings,
    // Semesters that have ratings
    semestersWithRatings,
    // All classes for the course (for term selector)
    courseClasses,
    // Whether course has any ratings
    hasRatings,
    // Loading state (single source of truth)
    loading,
    // Error state
    error,
    // Refetch all data (single function)
    refetch,
  };
};
