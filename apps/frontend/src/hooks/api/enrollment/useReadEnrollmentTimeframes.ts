import { useQuery } from "@apollo/client/react";

import {
  GetEnrollmentTimeframesDocument,
  GetEnrollmentTimeframesQuery,
  GetEnrollmentTimeframesQueryVariables,
  Semester,
} from "@/lib/generated/graphql";

export const useReadEnrollmentTimeframes = (
  year: number | null | undefined,
  semester: Semester | null | undefined,
  options?: Omit<
    Parameters<
      typeof useQuery<
        GetEnrollmentTimeframesQuery,
        GetEnrollmentTimeframesQueryVariables
      >
    >[1],
    "variables"
  >
) => {
  const query = useQuery(GetEnrollmentTimeframesDocument, {
    ...options,
    variables: { year: year!, semester: semester! },
    skip: !year || !semester || options?.skip,
  });

  return {
    ...query,
    data: query.data?.enrollmentTimeframes ?? [],
  };
};
