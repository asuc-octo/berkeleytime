import { gql } from "@apollo/client";

export type SessionIdentifier = string;

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
  id: SessionIdentifier;
  name: string;
  startDate?: string;
  endDate?: string;
  enrollBeginDate?: string;
  enrollEndDate?: string;
  temporalPosition: TemporalPosition;
}

export interface ITerm {
  year: number;
  semester: Semester;
  temporalPosition: TemporalPosition;
  academicCareerCode: string;
  sessions: ISession[];
  startDate?: string;
  endDate?: string;
  selfServiceEnrollBeginDate?: string;
  selfServiceEnrollEndDate?: string;
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
      academicCareerCode
      sessions {
        id
        name
        startDate
        endDate
        enrollBeginDate
        enrollEndDate
        temporalPosition
      }
      startDate
      endDate
      selfServiceEnrollBeginDate
      selfServiceEnrollEndDate
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
        enrollBeginDate
        enrollEndDate
        temporalPosition
      }
      startDate
      endDate
      selfServiceEnrollBeginDate
      selfServiceEnrollEndDate
    }
  }
`;
