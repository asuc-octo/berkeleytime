// TODO: Write major prereq
import { gql } from "graphql-tag";

const typeDef = gql`
  enum Colleges {
    "College of Letters and Sciences"
    LnS

    "College of Engineering"
    CoE

    "Haas School of Business"
    HAAS

    "Other"
    OTHER
  }

  enum UniReqs {
    AC
    AH
    AI
    CW
    QR
    RCA
    RCB
  }
  enum CollegeReqs {
    "Arts and Literature"
    LnS_AL

    "Biological Sciences"
    LnS_BS

    "Historical Studies"
    LnS_HS

    "International Studies"
    LnS_IS

    "Philosophy and Values"
    LnS_PV

    "Physical Science"
    LnS_PS

    "Social and Behavioral Sciences"
    LnS_SBS
    
    "Humanities and Social Sciences"
    CoE_HSS
    
    "HAAS Arts and Literature"
    HAAS_AL

    "HAAS Biological Sciences"
    HAAS_BS

    "HAAS Historical Studies"
    HAAS_HS

    "HAAS International Studies"
    HAAS_IS

    "HAAS Philosophy and Values"
    HAAS_PV

    "HAAS Physical Science"
    HAAS_PS
    
    "HAAS Social and Behavioral Sciences"
    HAAS_SBS
  }

  type MajorReq {
    name: String!
    major: String!
    numCoursesRequired: Int!
    satisfyingCourseIds: [String!]
    isMinor: Boolean!
  }

  type Plan {
    userEmail: String!
    planTerms: [PlanTerm!]
    miscellaneous: PlanTerm!
    uniReqs: [String!]
    collegeReqs: [String!]
    majorReqs: [MajorReq!]
    created: String!
    revised: String!
  }

  type PlanTerm {
    _id: ID
    name: String
    userEmail: String!
    year: Int!
    term: String!
    courses: [SelectedCourse!]
    customEvents: [CustomEvent!]
  }

  type SelectedCourse {
    """
    Identifiers (probably cs-course-ids) for the classes the user has added to their schedule.
    """
    classID: String!
    """
    Requirements satisfied by class
    """
    uniReqs: [String!]
    collegeReqs: [String!]
  }

  type CustomEvent {
    title: String
    description: String
    uniReqs: [String!]
    collegeReqs: [String!]
  }

  input MajorReqInput {
    name: String!
    major: String!
    numCoursesRequired: Int!
    satisfyingCourseIds: [String!]!
    isMinor: Boolean! 
  }

  input CustomEventInput {
    title: String
    description: String
    uniReqs: [UniReqs!]
    collegeReqs: [CollegeReqs!]
  }

  input SelectedCourseInput {
    classID: String!
    uniReqs: [UniReqs!]
    collegeReqs: [CollegeReqs!]
  }

  input PlanInput {
    college: Colleges!
    majorReqs: [MajorReqInput!]!
  }

  input PlanTermInput {
    name: String
    year: Int!
    term: String!
    courses: [SelectedCourseInput!]
    customEvents: [CustomEventInput!]
  }

  type Query {
    """
    Takes in user's email and returns their entire plan
    """
    planByUser: Plan @auth
    
    """
    Takes in an ID and returns the planTerm for that term.
    """
    planTermByID(id: ID!): PlanTerm
  }

  type Mutation {
    """
    Takes in user's email and a college, creates a new Plan record in the database, and returns the Plan
    """
    createNewPlan(college: Colleges!): Plan @auth

    """
    Edits Plan college and majorReqs
    """
    editPlan(plan: PlanInput!): Plan @auth

    """
    Takes in PlanTerm fields, creates a new PlanTerm record in the database, and returns the PlanTerm.
    """
    createNewPlanTerm(planTerm: PlanTermInput!): PlanTerm @auth

    """
    Takes in a PlanTerm's ObjectID, deletes the PlanTerm with that ID, and returns the ID.
    """
    removePlanTermByID(id: ID!): ID @auth
    
    """
    Takes in planTerm fields, find the planTerm record in the database corresponding to the provided term, 
    updates the record, and returns the updated planTerm
    """
    editPlanTerm(id: ID!, planTerm: PlanTermInput!): PlanTerm @auth
    
    """
    For the planTerm specified by the term, modifies the courses field, and returns the updated 
    planTerm.
    """
    setSelectedClasses(id: ID!, courses: [SelectedCourseInput!]!, customEvents: [CustomEventInput!]!): PlanTerm @auth

    """
    Deletes plan, for testing purposes
    """
    deletePlan: String @auth
  }
`;

export default typeDef;
