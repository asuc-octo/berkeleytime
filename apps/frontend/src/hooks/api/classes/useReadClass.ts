import { useQuery } from "@apollo/client/react";

import { Semester } from "@/lib/api";
import {
  GetClassDocument,
  GetClassQuery,
  GetClassQueryVariables,
} from "@/lib/generated/graphql";

export const useReadClass = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetClassQuery, GetClassQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetClassDocument, {
    fetchPolicy: "no-cache",
    nextFetchPolicy: "no-cache",
    ...options,
    variables: {
      year,
      semester,
      subject,
      courseNumber,
      number,
    },
  });

  return {
    ...query,
    data: query.data?.class,
  };
};
