import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import { GET_ALL_RATINGS_DATA, ICourse } from "@/lib/api";

interface UseGetRatingsOptions {
  subject: string;
  courseNumber: string;
}

export const useGetRatings = ({
  subject,
  courseNumber,
  course,
}: UseGetRatingsOptions & { course?: ICourse }) => {
  const { data, loading, error, refetch } = useQuery<any>(
    GET_ALL_RATINGS_DATA,
    {
      variables: {
        subject,
        courseNumber,
      },
      fetchPolicy: "cache-first",
    }
  );

  const courseClasses = useMemo(
    () =>
      course?.classes?.filter(
        (courseClass: any) => Boolean(courseClass)
      ) ?? [],
    [course?.classes]
  );

  const semestersWithRatings = useMemo(() => {
    if (!data?.semestersWithRatings) return [];
    return data.semestersWithRatings.filter((sem: any) => sem && sem.maxMetricCount > 0);
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
      course?.aggregatedRatings?.metrics?.filter((metric: any) =>
        Boolean(metric)
      ) ?? [];
    const totalRatings = metrics.reduce(
      (total: number, metric: any) => total + (metric?.count ?? 0),
      0
    );
    return totalRatings > 0;
  }, [course?.aggregatedRatings?.metrics]);

  return {
    userRatingsData: data?.userRatings
      ? { userRatings: data.userRatings }
      : undefined,
    userRatings,
    aggregatedRatings: course?.aggregatedRatings,
    semestersWithRatings,
    courseClasses,
    hasRatings,
    loading,
    error,
    refetch,
  };
};
