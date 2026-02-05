import { useApolloClient } from "@apollo/client";

import {
  COURSE_LOOKUP,
  CourseLookupResult,
} from "../../../lib/api/course";

interface CourseLookupResponse {
  course: CourseLookupResult | null;
}

export const useCourseLookup = () => {
  const client = useApolloClient();

  const lookupCourse = async (
    subject: string,
    number: string
  ): Promise<CourseLookupResult | null> => {
    try {
      const { data } = await client.query<CourseLookupResponse>({
        query: COURSE_LOOKUP,
        variables: { subject, number },
        fetchPolicy: "cache-first",
      });
      return data?.course ?? null;
    } catch {
      return null;
    }
  };

  return { lookupCourse };
};
