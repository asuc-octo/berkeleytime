import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import { GetAllRatingsDataDocument, Semester } from "@/lib/generated/graphql";

interface UseGetRatingsOptions {
  subject: string;
  courseNumber: string;
}

/**
 * Hook to fetch all ratings-related data for a course in a single query.
 * Eliminates flashing by loading all data upfront in one network request.
 * Follows the same pattern as useGetClassEnrollment, useGetCourseGrades, etc.
 */
export const useGetRatings = ({
  subject,
  courseNumber,
}: UseGetRatingsOptions) => {
  const { data, loading, error, refetch } = useQuery(
    GetAllRatingsDataDocument,
    {
      variables: {
        subject,
        courseNumber,
        courseNumberTyped: courseNumber, // Same value, different type for GraphQL
      },
      fetchPolicy: "cache-first",
    }
  );

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
    userRatingsData: data?.userRatings
      ? { userRatings: data.userRatings }
      : undefined,
    userRatings,
    aggregatedRatings: data?.course?.aggregatedRatings,
    semestersWithRatings,
    courseClasses,
    hasRatings,
    loading,
    error,
    refetch,
  };
};
