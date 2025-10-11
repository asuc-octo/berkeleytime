import { useQuery } from "@apollo/client/react";

import { READ_CLASS, READ_ENROLLMENT, ReadClassResponse, Semester } from "@/lib/api";

export const useReadClass = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<useQuery.Options<ReadClassResponse>, "variables">
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

/*
export const useReadEnrollment = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<QueryHookOptions<ReadClassResponse>, "variables">
) => {
  const query = useQuery<ReadClassResponse>(READ_ENROLLMENT, {
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
    data: query.data?.enrollment,
  };
}; */
