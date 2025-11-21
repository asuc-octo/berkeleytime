import { useQuery } from "@apollo/client/react";

import { Semester } from "@/lib/api";
import {
  ReadClassDetailsDocument,
  ReadClassDetailsQuery,
  ReadClassDetailsQueryVariables,
  ReadClassEnrollmentDocument,
  ReadClassEnrollmentQuery,
  ReadClassEnrollmentQueryVariables,
  ReadClassGradesDocument,
  ReadClassGradesQuery,
  ReadClassGradesQueryVariables,
  ReadClassSectionsDocument,
  ReadClassSectionsQuery,
  ReadClassSectionsQueryVariables,
} from "@/lib/generated/graphql";

export const useReadClass = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<ReadClassDetailsQuery, ReadClassDetailsQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(ReadClassDetailsDocument, {
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

export const useReadClassSections = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<ReadClassSectionsQuery, ReadClassSectionsQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(ReadClassSectionsDocument, {
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

export const useReadClassGrades = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<ReadClassGradesQuery, ReadClassGradesQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(ReadClassGradesDocument, {
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

export const useReadClassEnrollment = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<ReadClassEnrollmentQuery, ReadClassEnrollmentQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(ReadClassEnrollmentDocument, {
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
