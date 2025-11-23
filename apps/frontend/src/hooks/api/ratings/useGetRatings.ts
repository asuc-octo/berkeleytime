import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import { GET_RATINGS_FOR_TAB } from "@/lib/api";

interface UseGetRatingsOptions {
  subject: string;
  courseNumber: string;
}

export const useGetRatings = ({
  subject,
  courseNumber,
}: UseGetRatingsOptions) => {
  const { data, loading, error, refetch } = useQuery<any>(GET_RATINGS_FOR_TAB, {
    variables: {
      subject,
      courseNumber,
      courseNumberTyped: courseNumber,
    },
    fetchPolicy: "no-cache",
  });

  const courseClasses = useMemo(
    () =>
      data?.course?.classes?.filter((courseClass: any) =>
        Boolean(courseClass)
      ) ?? [],
    [data?.course?.classes]
  );

  const semestersWithRatings = useMemo(() => {
    if (!data?.semestersWithRatings) return [];
    return data.semestersWithRatings.filter(
      (sem: any) => sem && sem.maxMetricCount > 0
    );
  }, [data?.semestersWithRatings]);

  const userRatings = useMemo(() => {
    if (!data?.userRatings?.classes) return null;

    const matchedRating = data.userRatings.classes.find(
      (classRating: any) =>
        classRating &&
        classRating.subject === subject &&
        classRating.courseNumber === courseNumber
    );
    return matchedRating ?? null;
  }, [data?.userRatings?.classes, subject, courseNumber]);

  const hasRatings = useMemo(() => {
    const metrics =
      data?.course?.aggregatedRatings?.metrics?.filter((metric: any) =>
        Boolean(metric)
      ) ?? [];
    const totalRatings = metrics.reduce(
      (total: number, metric: any) => total + (metric?.count ?? 0),
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
