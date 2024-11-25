import { QueryHookOptions, useQuery } from "@apollo/client";

import { READ_CLASS, ReadClassResponse, Semester } from "@/lib/api";

export const useReadClass = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<QueryHookOptions<ReadClassResponse>, "variables">
) => {
  const query = useQuery<ReadClassResponse>(READ_CLASS, {
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