import { useCallback } from "react";

import { QueryHookOptions, useLazyQuery, useQuery } from "@apollo/client/react";

import {
  READ_COURSE,
  READ_COURSE_GRADE_DIST,
  READ_COURSE_TITLE,
  READ_COURSE_UNITS,
  READ_COURSE_WITH_INSTRUCTOR,
  ReadCourseResponse,
} from "@/lib/api";

export const useReadCourse = (
  subject: string,
  number: string,
  options?: Omit<useQuery.Options<ReadCourseResponse>, "variables">
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

export const useReadCourseGradeDist = (
  subject: string,
  number: string,
  options?: Omit<useQuery.Options<ReadCourseResponse>, "variables">
) => {
  const query = useQuery<ReadCourseResponse>(READ_COURSE_GRADE_DIST, {
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
  options?: Omit<useQuery.Options<ReadCourseResponse>, "variables">
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

export const useReadCourseTitle = (
  subject: string,
  number: string,
  options?: Omit<useQuery.Options<ReadCourseResponse>, "variables">
) => {
  const query = useQuery<ReadCourseResponse>(READ_COURSE_TITLE, {
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

export const useReadCourseUnits = () => {
  const [getCourseUnitsQuery, { loading, error }] =
    useLazyQuery<ReadCourseResponse>(READ_COURSE_UNITS);

  const getCourseUnits = useCallback(
    async (
      subject: string,
      number: string,
      semester: string,
      year: number,
      options?: Omit<QueryHookOptions<ReadCourseResponse>, "variables">
    ) => {
      const result = await getCourseUnitsQuery({
        ...options,
        variables: { subject, number },
      });
      const classes = result.data?.course?.classes;
      
      if (!classes || classes.length === 0) {
        return 0;
      }

      // find exact year/semester
      const exactMatch = classes.find(
        (cls) => cls.semester === semester && cls.year === year
      );
      if (exactMatch) {
        return exactMatch.unitsMax || 0;
      }

      // find latest year
      const latestYear = classes.reduce(
        (max, cls) => Math.max(max, cls.year),
        classes[0].year
      );
      const latestClass = classes.find(
        (cls) => cls.year === latestYear
      );
      return latestClass?.unitsMax || 0;
    },
    [getCourseUnitsQuery]
  );

  return [getCourseUnits, { loading, error }] as [
    getCourseUnits: typeof getCourseUnits,
    result: { loading: boolean; error: any },
  ];
};
