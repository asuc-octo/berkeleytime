import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import { GET_USER_RATINGS, UserRatingsResponse } from "@/lib/api/ratings";
import { GetUserRatingsDocument } from "@/lib/generated/graphql";

export const useUserRatings = () => {
  const { data, loading, error } = useQuery(
    GetUserRatingsDocument,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const ratings = useMemo(() => {
    if (!data?.userRatings?.classes) return [];

    return [...data.userRatings.classes].sort(
      (a, b) =>
        new Date(b.lastUpdated ?? 0).getTime() - new Date(a.lastUpdated ?? 0).getTime()
    );
  }, [data]);

  return {
    ratings,
    loading,
    error,
  };
};
