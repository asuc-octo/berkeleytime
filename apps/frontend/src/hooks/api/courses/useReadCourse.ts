import { QueryHookOptions, useQuery } from "@apollo/client";

import {
  READ_COURSE,
  READ_COURSE_WITH_INSTRUCTOR,
  ReadCourseResponse,
} from "@/lib/api";

export const useReadCourse = (
  subject: string,
  number: string,
  options?: Omit<QueryHookOptions<ReadCourseResponse>, "variables">
) => {
  const query = useQuery<ReadCourseResponse>(READ_COURSE, {
    ...options,
    variables: {
      subject,
      number,
    },
  });

  return {
    ...query,
    data: query.data?.course,
  };
};

export const useReadCourseWithInstructor = (
  subject: string,
  number: string,
  options?: Omit<QueryHookOptions<ReadCourseResponse>, "variables">
) => {
  const query = useQuery<ReadCourseResponse>(READ_COURSE_WITH_INSTRUCTOR, {
    ...options,
    variables: {
      subject,
      number,
    },
  });

  return {
    ...query,
    data: query.data?.course,
  };
};
