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
  _id?: string;
  userEmail: string;
  planTerms: IPlanTerm[];
  majors: string[];
  minors: string[];
  uniReqs: string[];
  collegeReqs: string[];
  majorReqs: IMajorReq[];
  created: string;
  revised: string;
  gridLayout: boolean;
  college: string;
  labels: ILabel[];
}

export interface IPlanTerm {
  _id?: string;
  name?: string;
  userEmail: string;
  year: number;
  term: string;
  courses: ISelectedCourse[];
  customCourses: ICustomCourse[];
}

export interface ISelectedCourse {
  courseID: string;
  uniReqs: string[];
  collegeReqs: string[];
  pnp: boolean;
  transfer: boolean;
  labels: ILabel[];
}

export interface ICustomCourse {
  title?: string;
  description?: string;
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
      userEmail
      majors
      minors
      college
      created
      revised
      gridLayout
      labels {
        name
        color
      }
      uniReqsSatisfied
      collegeReqsSatisfied
      planTerms {
        _id
        name
        year
        term
        hidden
        status
        pinned
        courses {
          courseID
          uniReqs
          collegeReqs
          pnp
          transfer
          labels {
            name
            color
          }
        }
        customCourses {
          title
          description
          uniReqs
          collegeReqs
          pnp
          transfer
          labels {
            name
            color
          }
        }
      }
    }
  }
`;

export const READ_PLAN = gql`
  query GetPlan {
    planByUser {
      _id
      userEmail
      majors
      minors
      college
      created
      revised
      gridLayout
      labels {
        name
        color
      }
      uniReqsSatisfied
      collegeReqsSatisfied
      planTerms {
        _id
        name
        year
        term
        hidden
        status
        pinned
        courses {
          courseID
          uniReqs
          collegeReqs
          pnp
          transfer
          labels {
            name
            color
          }
        }
        customCourses {
          title
          description
          uniReqs
          collegeReqs
          pnp
          transfer
          labels {
            name
            color
          }
        }
      }
    }
  }
`;
