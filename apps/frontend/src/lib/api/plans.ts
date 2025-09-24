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

export interface IPlan {
  _id?: string;
  userEmail: string;
  planTerms: IPlanTerm[];
  miscellaneous: IPlanTerm;
  majors: string[];
  minors: string[];
  uniReqs: string[];
  collegeReqs: string[];
  majorReqs: IMajorReq[];
  created: string;
  revised: string;
}

export interface IPlanTerm {
  _id?: string;
  name?: string;
  userEmail: string;
  year: number;
  term: string;
  courses: ISelectedCourse[];
  customEvents: ICustomEvent[];
}

export interface ISelectedCourse {
  classID: string;
  uniReqs: string[];
  collegeReqs: string[];
}

export interface ICustomEvent {
  title?: string;
  description?: string;
  uniReqs: string[];
  collegeReqs: string[];
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
  mutation CreateNewPlan($college: Colleges!, $majors: [String!]!, $minors: [String!]!) {
    createNewPlan(college: $college, majors: $majors, minors: $minors) {
      _id
      userEmail
      planTerms {
        _id
        name
        userEmail
        year
        term
        courses {
          classID
          uniReqs
          collegeReqs
        }
        customEvents {
          title
          description
          uniReqs
          collegeReqs
        }
      }
      majors
      minors
      uniReqs
      collegeReqs
      majorReqs {
        name
        major
        numCoursesRequired
        satisfyingCourseIds
        isMinor
      }
      created
      revised
    }
  }
`;

export const READ_PLAN = gql`
  query GetPlan {
    planByUser {
      _id
      userEmail
      planTerms {
        _id
        name
        userEmail
        year
        term
        courses {
          classID
          uniReqs
          collegeReqs
        }
        customEvents {
          title
          description
          uniReqs
          collegeReqs
        }
      }
      majors
      minors
      uniReqs
      collegeReqs
      majorReqs {
        name
        major
        numCoursesRequired
        satisfyingCourseIds
        isMinor
      }
      created
      revised
    }
  }
`;
