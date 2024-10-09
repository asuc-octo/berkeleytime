import { gql } from "@apollo/client";

export enum Semester {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
  Winter = "Winter",
}

export enum TemporalPosition {
  Current = "Current",
  Future = "Future",
  Past = "Past",
}

export interface ISession {
  name: string;
  startDate?: string;
  endDate?: string;
  temporalPosition: TemporalPosition;
}

export interface ITerm {
  year: number;
  semester: Semester;
  temporalPosition: TemporalPosition;
  sessions: ISession[];
  startDate?: string;
  endDate?: string;
}

export interface GetTermsResponse {
  terms: ITerm[];
}

export const GET_TERMS = gql`
  query GetTerms {
    terms {
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

export interface GetTermResponse {
  term: ITerm;
}

export const GET_TERM = gql`
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
