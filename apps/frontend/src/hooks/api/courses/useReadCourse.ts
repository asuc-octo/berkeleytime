import { useCallback } from "react";

import { useLazyQuery, useQuery } from "@apollo/client/react";

import { GET_CLASS_OVERVIEW } from "@/lib/api/courses";
import {
  GetClassOverviewQuery,
  GetClassOverviewQueryVariables,
  GetCourseOverviewByIdDocument,
  GetCourseOverviewByIdQuery,
  GetCourseOverviewByIdQueryVariables,
  GetCourseDocument,
  GetCourseGradeDistDocument,
  GetCourseGradeDistQuery,
  GetCourseGradeDistQueryVariables,
  GetCourseQuery,
  GetCourseQueryVariables,
  GetCourseTitleDocument,
  GetCourseTitleQuery,
  GetCourseTitleQueryVariables,
  GetCourseUnitsDocument,
  GetCourseUnitsQuery,
  GetCourseUnitsQueryVariables,
  GetCourseWithInstructorDocument,
  GetCourseWithInstructorQuery,
  GetCourseWithInstructorQueryVariables,
} from "@/lib/generated/graphql";

export const useGetCourse = (
  subject: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetCourseQuery, GetCourseQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetCourseDocument, {
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

export const useGetClassOverview = (
  subject: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetClassOverviewQuery, GetClassOverviewQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery<GetClassOverviewQuery, GetClassOverviewQueryVariables>(
    GET_CLASS_OVERVIEW,
    {
      ...options,
      variables: {
        subject,
        number,
      },
    }
  );

  return {
    ...query,
    data: query.data?.course,
  };
};

export const useGetCourseOverviewById = (
  courseId: string,
  options?: Omit<
    useQuery.Options<GetCourseOverviewByIdQuery, GetCourseOverviewByIdQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetCourseOverviewByIdDocument, {
    ...options,
    variables: {
      courseId,
    },
  });

  return {
    ...query,
    data: query.data?.courseById,
  };
};

export const useGetCourseGradeDist = (
  subject: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetCourseGradeDistQuery, GetCourseGradeDistQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetCourseGradeDistDocument, {
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

export const useGetCourseWithInstructor = (
  subject: string,
  number: string,
  options?: Omit<
    useQuery.Options<
      GetCourseWithInstructorQuery,
      GetCourseWithInstructorQueryVariables
    >,
    "variables"
  >
) => {
  const query = useQuery(GetCourseWithInstructorDocument, {
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

export const useGetCourseTitle = (
  subject: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetCourseTitleQuery, GetCourseTitleQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetCourseTitleDocument, {
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

export const useGetCourseUnits = () => {
  const [getCourseUnitsQuery, { loading, error }] = useLazyQuery(
    GetCourseUnitsDocument
  );

  const getCourseUnits = useCallback(
    async (
      subject: string,
      number: string,
      semester: string,
      year: number,
      options?: Omit<
        useQuery.Options<GetCourseUnitsQuery, GetCourseUnitsQueryVariables>,
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
    result: { loading: boolean; error: unknown },
  ];
};

// Backward compatibility exports (deprecated)
export const useReadCourse = useGetCourse;
export const useReadCourseGradeDist = useGetCourseGradeDist;
export const useReadCourseWithInstructor = useGetCourseWithInstructor;
export const useReadCourseTitle = useGetCourseTitle;
export const useReadCourseUnits = useGetCourseUnits;
