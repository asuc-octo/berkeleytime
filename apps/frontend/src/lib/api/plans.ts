import { gql } from "@apollo/client";

export enum Colleges {
  LnS = "LnS",
  CoE = "CoE", 
  HAAS = "HAAS",
  OTHER = "OTHER"
}

export type DegreeOption = {
  label: string;
  value: string;
};

export interface ILabel {
  name: string;
  color: string;
}

export interface IPlan {
  _id: string;
  userEmail: string;
  planTerms: IPlanTerm[];
  majorReqs: IMajorReq[];
  majors: string[];
  minors: string[];
  created: string;
  revised: string;
  college: string;
  labels: ILabel[];
  uniReqsSatisfied: string[];
  collegeReqsSatisfied: string[];
}

export interface IPlanTerm {
  _id: string;
  name: string;
  userEmail: string;
  year: number;
  term: string;
  courses: ISelectedCourse[];
  hidden: boolean;
  status: string;
  pinned: boolean;
}

export interface ISelectedCourse {
  courseID: string;
  courseName: string;
  courseTitle: string;
  courseUnits: number;
  uniReqs: string[];
  collegeReqs: string[];
  pnp: boolean;
  transfer: boolean;
  labels: ILabel[];
}

export interface IMajorReq {
  name: string;
  major: string;
  numCoursesRequired: number;
  satisfyingCourseIds: string[];
  isMinor: boolean;
}

export interface CreatePlanResponse {
  createNewPlan: IPlan;
}

export interface ReadPlanResponse {
  planByUser: IPlan[];
}

export const CREATE_NEW_PLAN = gql`
  mutation CreateNewPlan(
    $college: Colleges!
    $startYear: Int!
    $endYear: Int!
    $majors: [String!]!
    $minors: [String!]!
  ) {
    createNewPlan(
      college: $college
      startYear: $startYear
      endYear: $endYear
      majors: $majors
      minors: $minors
    ) {
      _id
      planTerms {
        _id
        name
        year
        term
        courses {
          courseID
          courseName
          courseTitle
          courseUnits
          uniReqs
          collegeReqs
          pnp
          transfer
        }
        hidden
        status
        pinned
      }
      majors
      minors
      college
      labels {
        name
        color
      }
      uniReqsSatisfied
      collegeReqsSatisfied
    }
  }
`;

export const READ_PLAN = gql`
  query GetPlan {
    planByUser {
      _id
      planTerms {
        _id
        name
        year
        term
        courses {
          courseID
          courseName
          courseTitle
          courseUnits
          uniReqs
          collegeReqs
          pnp
          transfer
        }
        hidden
        status
        pinned
      }
      majors
      minors
      college
      labels {
        name
        color
      }
      uniReqsSatisfied
      collegeReqsSatisfied
    }
  }
`;
