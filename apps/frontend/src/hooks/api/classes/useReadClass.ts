import { useQuery } from "@apollo/client/react";

import {
  ReadClassDetailsDocument,
  ReadClassDetailsQuery,
  ReadClassDetailsQueryVariables,
  ReadClassEnrollmentDocument,
  ReadClassEnrollmentQuery,
  ReadClassEnrollmentQueryVariables,
  ReadClassRatingsDocument,
  ReadClassRatingsQuery,
  ReadClassRatingsQueryVariables,
  ReadClassSectionsDocument,
  ReadClassSectionsQuery,
  ReadClassSectionsQueryVariables,
  ReadCourseGradesDocument,
  ReadCourseGradesQuery,
  ReadCourseGradesQueryVariables,
  Semester,
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

export const useReadCourseGrades = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<ReadCourseGradesQuery, ReadCourseGradesQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(ReadCourseGradesDocument, {
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
    useQuery.Options<
      ReadClassEnrollmentQuery,
      ReadClassEnrollmentQueryVariables
    >,
    "variables"
  >
) => {
  const query = useQuery(ReadClassEnrollmentDocument, {
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

export const useReadClassRatings = (
  subject: string,
  courseNumber: string,
  options?: Omit<
    useQuery.Options<ReadClassRatingsQuery, ReadClassRatingsQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(ReadClassRatingsDocument, {
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
