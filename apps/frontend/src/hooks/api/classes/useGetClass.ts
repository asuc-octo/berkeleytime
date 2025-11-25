import { useQuery } from "@apollo/client/react";

import {
  GET_CLASS_DETAILS,
  GET_CLASS_ENROLLMENT,
  GET_CLASS_RATINGS,
  GET_CLASS_SECTIONS,
  GET_CLASS_GRADES,
} from "@/lib/api/classes";
import {
  GetClassDetailsQuery,
  GetClassDetailsQueryVariables,
  GetClassEnrollmentQuery,
  GetClassEnrollmentQueryVariables,
  GetClassRatingsQuery,
  GetClassRatingsQueryVariables,
  GetClassSectionsQuery,
  GetClassSectionsQueryVariables,
  GetClassGradesQuery,
  GetClassGradesQueryVariables,
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
  const query = useQuery(GET_CLASS_DETAILS, {
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
  const query = useQuery(GET_CLASS_SECTIONS, {
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

export const useGetClassGrades = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<
    useQuery.Options<GetClassGradesQuery, GetClassGradesQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GET_CLASS_GRADES, {
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
  const query = useQuery(GET_CLASS_ENROLLMENT, {
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
  const query = useQuery(GET_CLASS_RATINGS, {
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
