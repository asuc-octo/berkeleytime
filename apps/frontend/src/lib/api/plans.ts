import { gql } from "@apollo/client";

import { GetPlanQuery, GetPlansQuery } from "../generated/graphql";

export type ILabel = NonNullable<
  GetPlanQuery["planByUser"][number]["labels"]
>[number];

export type IPlan = NonNullable<GetPlanQuery["planByUser"]>[number];

export type IPlanTerm = NonNullable<
  GetPlanQuery["planByUser"]
>[number]["planTerms"][number];

export type ISelectedCourse = NonNullable<
  GetPlanQuery["planByUser"]
>[number]["planTerms"][number]["courses"][number];

export const CREATE_NEW_PLAN = gql`
  mutation CreateNewPlan(
    $colleges: [Colleges!]!
    $startYear: Int!
    $endYear: Int!
    $majors: [String!]!
    $minors: [String!]!
  ) {
    createNewPlan(
      colleges: $colleges
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
      colleges
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
      colleges
      labels {
        name
        color
      }
      uniReqsSatisfied
      collegeReqsSatisfied
    }
  }
`;

export const READ_PLANS = gql`
  query GetPlans {
    planByUser {
      _id
    }
  }
`;

export const EDIT_PLAN = gql`
  mutation EditPlan($plan: PlanInput!) {
    editPlan(plan: $plan) {
      uniReqsSatisfied
      collegeReqsSatisfied
      majors
      minors
      labels {
        name
        color
      }
    }
  }
`;

export const SET_SELECTED_COURSES = gql`
  mutation SetSelectedCourses($id: ID!, $courses: [SelectedCourseInput!]!) {
    setSelectedCourses(id: $id, courses: $courses) {
      _id
    }
  }
`;

export const CREATE_NEW_PLAN_TERM = gql`
  mutation CreateNewPlanTerm($planTerm: PlanTermInput!) {
    createNewPlanTerm(planTerm: $planTerm) {
      _id
      name
      userEmail
      year
      term
      hidden
      status
      pinned
    }
  }
`;

export const REMOVE_PLAN_TERM_BY_ID = gql`
  mutation RemovePlanTermByID($removePlanTermByIdId: ID!) {
    removePlanTermByID(id: $removePlanTermByIdId)
  }
`;

export const EDIT_PLAN_TERM = gql`
  mutation EditPlanTerm($id: ID!, $planTerm: EditPlanTermInput!) {
    editPlanTerm(id: $id, planTerm: $planTerm) {
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
