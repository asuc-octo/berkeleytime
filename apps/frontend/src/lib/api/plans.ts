import { gql } from "@apollo/client";

import {
  GetCourseRequirementsQuery,
  GetPlanQuery,
  GetUcRequirementsQuery,
} from "../generated/graphql";

export type ILabel = NonNullable<
  GetPlanQuery["planByUser"][number]["labels"]
>[number];

export type IPlan = NonNullable<GetPlanQuery["planByUser"]>[number];

export type IPlanTerm = NonNullable<
  GetPlanQuery["planByUser"]
>[number]["planTerms"][number];

export type ISelectedCourse = NonNullable<
  GetPlanQuery["planByUser"]
>[number]["planTerms"][number]["courses"][number] & {
  course?: NonNullable<GetCourseRequirementsQuery["course"]>;
};

export type IPlanRequirement = NonNullable<
  GetUcRequirementsQuery["ucRequirements"]
>[number];

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
      selectedPlanRequirements {
        planRequirement {
          _id
          code
          isUcReq
          college
          major
          minor
          isOfficial
        }
        manualOverrides
      }
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

export const GET_COURSE_REQUIREMENTS = gql`
  query GetCourseRequirements($number: CourseNumber!, $subject: String!) {
    course(number: $number, subject: $subject) {
      mostRecentClass {
        requirementDesignation {
          code
          description
          formalDescription
        }
        primarySection {
          sectionAttributes {
            attribute {
              code
              description
              formalDescription
            }
            value {
              code
              description
              formalDescription
            }
          }
        }
      }
    }
  }
`;

export const GET_PLAN_REQUIREMENTS_BY_MAJORS_AND_MINORS = gql`
  query GetPlanRequirementsByMajorsAndMinors(
    $majors: [String!]!
    $minors: [String!]!
  ) {
    planRequirementsByMajorsAndMinors(majors: $majors, minors: $minors) {
      _id
      code
      isUcReq
      college
      major
      minor
      isOfficial
    }
  }
`;

export const GET_UC_REQUIREMENTS = gql`
  query GetUcRequirements {
    ucRequirements {
      _id
      code
      isUcReq
      college
      major
      minor
      isOfficial
    }
  }
`;

export const GET_COLLEGE_REQUIREMENTS = gql`
  query GetCollegeRequirements($college: String!) {
    collegeRequirements(college: $college) {
      _id
      code
      isUcReq
      college
      major
      minor
      isOfficial
    }
  }
`;

export const UPDATE_MANUAL_OVERRIDE = gql`
  mutation UpdateManualOverride($input: UpdateManualOverrideInput!) {
    updateManualOverride(input: $input) {
      _id
      selectedPlanRequirements {
        planRequirement {
          _id
        }
        manualOverrides
      }
    }
  }
`;

export const UPDATE_SELECTED_PLAN_REQUIREMENTS = gql`
  mutation UpdateSelectedPlanRequirements(
    $selectedPlanRequirements: [SelectedPlanRequirementInput!]!
  ) {
    updateSelectedPlanRequirements(
      selectedPlanRequirements: $selectedPlanRequirements
    ) {
      _id
      selectedPlanRequirements {
        planRequirement {
          _id
          code
          isUcReq
          college
          major
          minor
          isOfficial
        }
        manualOverrides
      }
    }
  }
`;
