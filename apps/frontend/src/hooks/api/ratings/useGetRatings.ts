import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import { GET_CLASS_RATINGS_DATA } from "@/lib/api";
import {
  GetClassRatingsDataQuery,
  GetClassRatingsDataQueryVariables,
} from "@/lib/generated/graphql";

interface UseGetRatingsOptions {
  subject: string;
  courseNumber: string;
}

export const useGetClassRatingsData = ({
  subject,
  courseNumber,
}: UseGetRatingsOptions) => {
  const { data, loading, error, refetch } = useQuery<
    GetClassRatingsDataQuery,
    GetClassRatingsDataQueryVariables
  >(GET_CLASS_RATINGS_DATA, {
    variables: {
      subject,
      courseNumber,
      courseNumberTyped: courseNumber,
    },
    fetchPolicy: "no-cache",
  });

  const courseClasses = useMemo(
    () =>
      data?.course?.classes?.filter((courseClass) => Boolean(courseClass)) ??
      [],
    [data?.course?.classes]
  );

  const semestersWithRatings = useMemo(() => {
    if (!data?.semestersWithRatings) return [];
    return data.semestersWithRatings.filter((sem) => sem.maxMetricCount > 0);
  }, [data?.semestersWithRatings]);

  const userRatings = useMemo(() => {
    if (!data?.userRatings?.classes) return null;

    const matchedRating = data.userRatings.classes.find(
      (classRating) =>
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

  const instructorAggregatedRatings = useMemo(() => {
    if (!data?.course?.instructorAggregatedRatings) return [];
    return data.course.instructorAggregatedRatings.filter((rating) =>
      Boolean(rating)
    );
  }, [data?.course?.instructorAggregatedRatings]);

  return {
    userRatingsData: data?.userRatings
      ? { userRatings: data.userRatings }
      : undefined,
    userRatings,
    aggregatedRatings: data?.course?.aggregatedRatings,
    instructorAggregatedRatings,
    semestersWithRatings,
    courseClasses,
    hasRatings,
    loading,
    error,
    refetch,
  };
};
