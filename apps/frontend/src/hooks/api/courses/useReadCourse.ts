import { useCallback } from "react";

import { useLazyQuery, useQuery } from "@apollo/client/react";

import { GET_COURSE_FOR_CLASS } from "@/lib/api/courses";
import {
  GetCourseForClassQuery,
  GetCourseForClassQueryVariables,
  ReadCourseDocument,
  ReadCourseGradeDistDocument,
  ReadCourseGradeDistQuery,
  ReadCourseGradeDistQueryVariables,
  ReadCourseQuery,
  ReadCourseQueryVariables,
  ReadCourseTitleDocument,
  ReadCourseTitleQuery,
  ReadCourseTitleQueryVariables,
  ReadCourseUnitsDocument,
  ReadCourseUnitsQuery,
  ReadCourseUnitsQueryVariables,
  ReadCourseWithInstructorDocument,
  ReadCourseWithInstructorQuery,
  ReadCourseWithInstructorQueryVariables,
} from "@/lib/generated/graphql";

export const useReadCourse = (
  subject: string,
  number: string,
  options?: Omit<
    useQuery.Options<ReadCourseQuery, ReadCourseQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(ReadCourseDocument, {
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

export const useGetCourseForClass = (
  subject: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetCourseForClassQuery, GetCourseForClassQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery<any>(GET_COURSE_FOR_CLASS, {
    ...(options as any),
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
  options?: Omit<
    useQuery.Options<
      ReadCourseGradeDistQuery,
      ReadCourseGradeDistQueryVariables
    >,
    "variables"
  >
) => {
  const query = useQuery(ReadCourseGradeDistDocument, {
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
  options?: Omit<
    useQuery.Options<
      ReadCourseWithInstructorQuery,
      ReadCourseWithInstructorQueryVariables
    >,
    "variables"
  >
) => {
  const query = useQuery(ReadCourseWithInstructorDocument, {
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
  options?: Omit<
    useQuery.Options<ReadCourseTitleQuery, ReadCourseTitleQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(ReadCourseTitleDocument, {
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
  const [getCourseUnitsQuery, { loading, error }] = useLazyQuery(
    ReadCourseUnitsDocument
  );

  const getCourseUnits = useCallback(
    async (
      subject: string,
      number: string,
      semester: string,
      year: number,
      options?: Omit<
        useQuery.Options<ReadCourseUnitsQuery, ReadCourseUnitsQueryVariables>,
        "variables"
      >
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
      const latestClass = classes.find((cls) => cls.year === latestYear);
      return latestClass?.unitsMax || 0;
    },
    [getCourseUnitsQuery]
  );

  return [getCourseUnits, { loading, error }] as [
    getCourseUnits: typeof getCourseUnits,
    result: { loading: boolean; error: any },
  ];
};
