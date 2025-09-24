import { gql } from "@apollo/client";

export enum Colleges {
  LnS = "LnS",
  CoE = "CoE", 
  HAAS = "HAAS",
  OTHER = "OTHER"
}

export enum CollegeReqs {
  LnS_AL = "LnS_AL",
  LnS_BS = "LnS_BS",
  LnS_HS = "LnS_HS",
  LnS_IS = "LnS_IS",
  LnS_PV = "LnS_PV",
  LnS_PS = "LnS_PS",
  LnS_SBS = "LnS_SBS",
  CoE_HSS = "CoE_HSS",
  HAAS_AL = "HAAS_AL",
  HAAS_BS = "HAAS_BS",
  HAAS_HS = "HAAS_HS",
  HAAS_IS = "HAAS_IS",
  HAAS_PV = "HAAS_PV",
  HAAS_PS = "HAAS_PS",
  HAAS_SBS = "HAAS_SBS"
}

export enum UniReqs {
  AC = "AC",
  AH = "AH",
  AI = "AI",
  CW = "CW",
  QR = "QR",
  RCA = "RCA",
  RCB = "RCB"
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
  uniReqs: UniReqs[];
  collegeReqs: CollegeReqs[];
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
          labels {
            name
            color
          }
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
          labels {
            name
            color
          }
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


export interface SelectedCourseInput {
  courseID: string;
  courseName: string;
  courseTitle: string;
  courseUnits: number;
  uniReqs: string[];
  collegeReqs: string[];
  pnp: boolean;
  transfer: boolean;
  labels: LabelInput[];
}

export interface LabelInput {
  name: string;
  color: string;
}

export interface SetSelectedCoursesResponse {
  setSelectedCourses: IPlanTerm;
}

export const SET_SELECTED_COURSES = gql`
  mutation SetSelectedCourses($id: ID!, $courses: [SelectedCourseInput!]!) {
    setSelectedCourses(id: $id, courses: $courses) {
      _id
      name
      userEmail
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
        labels {
          name
          color
        }
      }
      hidden
      status
      pinned
    }
  }
`;

