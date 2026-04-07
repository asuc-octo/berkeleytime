import { useQuery } from "@apollo/client/react";

import {
  GetClassDetailsDocument,
  GetClassDetailsQuery,
  GetClassDetailsQueryVariables,
  GetClassEnrollmentDocument,
  GetClassEnrollmentQuery,
  GetClassEnrollmentQueryVariables,
  GetClassGradesDocument,
  GetClassGradesQuery,
  GetClassGradesQueryVariables,
  GetClassSectionsDocument,
  GetClassSectionsQuery,
  GetClassSectionsQueryVariables,
  Semester,
} from "@/lib/generated/graphql";

export const useGetClass = (
  year: number,
  semester: Semester,
  sessionId: string,
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
      sessionId,
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
  sessionId: string,
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
      sessionId,
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

export const useGetClassGrades = (
  year: number,
  semester: Semester,
  sessionId: string,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetClassGradesQuery, GetClassGradesQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetClassGradesDocument, {
    ...options,
    variables: {
      year,
      semester,
      sessionId,
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
  sessionId: string,
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
      sessionId,
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
