import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";

import { GET_USER_RATINGS, UserRatingsResponse } from "@/lib/api/ratings";

export const useUserRatings = () => {
  const { data, loading, error } = useQuery<UserRatingsResponse>(
    GET_USER_RATINGS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const ratings = useMemo(() => {
    if (!data?.userRatings?.classes) return [];

    return [...data.userRatings.classes].sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }, [data]);

  return {
    ratings,
    loading,
    error,
  };
};
