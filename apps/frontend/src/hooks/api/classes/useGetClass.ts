import { useQuery } from "@apollo/client/react";

import {
  GetClassDetailsDocument,
  GetClassDetailsQuery,
  GetClassDetailsQueryVariables,
  GetClassEnrollmentDocument,
  GetClassEnrollmentQuery,
  GetClassEnrollmentQueryVariables,
  GetClassRatingsDocument,
  GetClassRatingsQuery,
  GetClassRatingsQueryVariables,
  GetClassSectionsDocument,
  GetClassSectionsQuery,
  GetClassSectionsQueryVariables,
  GetCourseGradesDocument,
  GetCourseGradesQuery,
  GetCourseGradesQueryVariables,
  Semester,
} from "@/lib/generated/graphql";

export const useGetClass = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetClassDetailsQuery, GetClassDetailsQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetClassDetailsDocument, {
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
    data: query.data?.class ?? query.previousData?.class,
    isStale: !query.data && !!query.previousData,
  };
};

export const useGetClassSections = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetClassSectionsQuery, GetClassSectionsQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetClassSectionsDocument, {
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

export const useGetCourseGrades = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetCourseGradesQuery, GetCourseGradesQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetCourseGradesDocument, {
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

export const useGetClassEnrollment = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetClassEnrollmentQuery, GetClassEnrollmentQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetClassEnrollmentDocument, {
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

export const useGetClassRatings = (
  subject: string,
  courseNumber: string,
  options?: Omit<
    useQuery.Options<GetClassRatingsQuery, GetClassRatingsQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetClassRatingsDocument, {
    ...options,
    variables: {
      subject,
      courseNumber,
    },
  });

  return {
    ...query,
    data: query.data?.course,
  };
};
