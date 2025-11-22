import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import {
  GetCourseRatingsDocument,
  GetSemestersWithRatingsDocument,
  GetUserRatingsDocument,
  ReadCourseClassesForRatingsDocument,
  Semester,
} from "@/lib/generated/graphql";

interface UseReadRatingsOptions {
  subject: string;
  courseNumber: string;
  userId?: string | null;
}

/**
 * Hook to fetch all ratings-related data for a course.
 * Follows the same pattern as useReadClassEnrollment, useReadCourseGrades, etc.
 */
export const useReadRatings = ({
  subject,
  courseNumber,
  userId,
}: UseReadRatingsOptions) => {
  // Get user's existing ratings
  const {
    data: userRatingsData,
    loading: userRatingsLoading,
    refetch: refetchUserRatings,
  } = useQuery(GetUserRatingsDocument, {
    skip: !userId,
  });

  // Get aggregated ratings for display
  const {
    data: aggregatedRatings,
    loading: aggregatedRatingsLoading,
    refetch: refetchAggregatedRatings,
  } = useQuery(GetCourseRatingsDocument, {
    variables: {
      subject,
      number: courseNumber,
    },
  });

  // Get semesters with ratings
  const {
    data: semestersWithRatingsData,
    loading: semestersWithRatingsLoading,
    refetch: refetchSemesters,
  } = useQuery(GetSemestersWithRatingsDocument, {
    variables: {
      subject,
      courseNumber,
    },
  });

  // Get course classes for term selector
  // Fetch unconditionally to avoid dynamic skip causing re-renders
  const {
    data: courseClassesData,
    loading: courseClassesLoading,
    refetch: refetchCourseClasses,
  } = useQuery(ReadCourseClassesForRatingsDocument, {
    variables: {
      subject,
      number: courseNumber,
    },
  });

  const courseClasses = useMemo(
    () =>
      courseClassesData?.course?.classes?.filter(
        (courseClass): courseClass is NonNullable<typeof courseClass> =>
          Boolean(courseClass)
      ) ?? [],
    [courseClassesData]
  );

  const semestersWithRatings = useMemo(() => {
    if (!semestersWithRatingsData) return [];
    return semestersWithRatingsData.semestersWithRatings.filter(
      (sem) => sem.maxMetricCount > 0
    );
  }, [semestersWithRatingsData]);

  const userRatings = useMemo(() => {
    if (!userRatingsData?.userRatings?.classes) return null;

    const matchedRating = userRatingsData.userRatings.classes.find(
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
  }, [userRatingsData, subject, courseNumber]);

  // Calculate hasRatings after queries - used for UI logic only, not query execution
  // This prevents dynamic skip conditions from causing re-renders
  const hasRatings = useMemo(() => {
    const metrics =
      aggregatedRatings?.course?.aggregatedRatings?.metrics?.filter(
        (metric) => Boolean(metric)
      ) ?? [];
    const totalRatings = metrics.reduce(
      (total, metric) => total + (metric.count ?? 0),
      0
    );
    return totalRatings > 0;
  }, [aggregatedRatings]);

  const loading =
    aggregatedRatingsLoading ||
    semestersWithRatingsLoading ||
    (userId && userRatingsLoading) ||
    courseClassesLoading;

  const refetchAll = () => {
    refetchAggregatedRatings();
    refetchSemesters();
    refetchCourseClasses();
    if (userId) {
      refetchUserRatings();
    }
  };

  return {
    userRatingsData,
    userRatings,
    aggregatedRatings: aggregatedRatings?.course?.aggregatedRatings,
    semestersWithRatings,
    courseClasses,
    hasRatings,
    loading,
    refetch: refetchAll,
  };
};
