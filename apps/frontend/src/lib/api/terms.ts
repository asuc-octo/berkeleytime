import { gql } from "@apollo/client";

import { GetTermsQuery } from "../generated/graphql";

export type ISession = NonNullable<
  GetTermsQuery["terms"][number]["sessions"]
>[number];

export type ITerm = NonNullable<GetTermsQuery>["terms"][number];

export const READ_TERMS = gql`
  query GetTerms {
    terms {
      year
      semester
      temporalPosition
      sessions {
        id
        name
        startDate
        endDate
        temporalPosition
      }
      startDate
      endDate
    }
  }
`;

export const READ_TERM = gql`
  query GetTerm($year: Int!, $semester: Semester!) {
    term(year: $year, semester: $semester) {
      year
      semester
      temporalPosition
      sessions {
        name
        startDate
        endDate
        temporalPosition
      }
      startDate
      endDate
    }
  }
`;
