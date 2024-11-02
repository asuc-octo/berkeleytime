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

export interface ReadTermsResponse {
  terms: ITerm[];
}

export const READ_TERMS = gql`
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

export interface ReadTermResponse {
  term: ITerm;
}

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
