// TODO: Write major prereq
import { gql } from "graphql-tag";

const typeDef = gql`
  enum Terms {
    Fall
    Spring
    Summer
  }

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

  enum Status {
    Complete
    InProgress
    Incomplete
    None
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

  """
  Not in use atm
  """
  type MajorReq {
    name: String!
    major: String!
    numCoursesRequired: Int!
    satisfyingCourseIds: [String!]!
    isMinor: Boolean!
  }

  type Label {
    name: String!
    color: String!
  }

  type Plan {
    _id: ID!
    userEmail: String!
    planTerms: [PlanTerm!]!
    majorReqs: [MajorReq!]!
    majors: [String!]!
    minors: [String!]!
    created: String!
    revised: String!
    gridLayout: Boolean!
    college: String!
    labels: [Label!]!
    """
    Requirements manually satisfied
    """
    uniReqsSatisfied: [String!]!
    collegeReqsSatisfied: [String!]!
  }

  type PlanTerm {
    _id: ID!
    name: String!
    userEmail: String!
    year: Int!
    term: String!
    courses: [SelectedCourse!]!
    customCourses: [CustomCourse!]!
    hidden: Boolean!
    status: String!
    pinned: Boolean!
  }

  type SelectedCourse {
    """
    Identifiers (probably cs-course-ids) for the classes the user has added to their schedule.
    """
    courseID: String!
    """
    Requirements satisfied by class
    """
    uniReqs: [String!]!
    collegeReqs: [String!]!
    pnp: Boolean!
    transfer: Boolean!
    labels: [Label!]!
  }

  type CustomCourse {
    title: String!
    description: String!
    uniReqs: [String!]!
    collegeReqs: [String!]!
    pnp: Boolean!
    transfer: Boolean!
    labels: [Label!]!
  }

  input MajorReqInput {
    name: String!
    major: String!
    numCoursesRequired: Int!
    satisfyingCourseIds: [String!]!
    isMinor: Boolean! 
  }

  input LabelInput {
    name: String!
    color: String!
  }

  input CustomCourseInput {
    title: String!
    description: String!
    uniReqs: [UniReqs!]!
    collegeReqs: [CollegeReqs!]!
    pnp: Boolean!
    transfer: Boolean!
    labels: [LabelInput!]!
  }

  input SelectedCourseInput {
    courseID: String!
    uniReqs: [UniReqs!]!
    collegeReqs: [CollegeReqs!]!
    pnp: Boolean!
    transfer: Boolean!
    labels: [LabelInput!]!
  }

  input PlanInput {
    college: Colleges
    majors: [String!]
    minors: [String!]
    majorReqs: [MajorReqInput!]
    gridLayout: Boolean
    labels: [LabelInput!]
    uniReqsSatisfied: [UniReqs!]
    collegeReqsSatisfied: [CollegeReqs!]
  }

  input PlanTermInput {
    name: String!
    year: Int!
    term: Terms!
    courses: [SelectedCourseInput!]!
    customCourses: [CustomCourseInput!]!
    hidden: Boolean!
    status: Status!
    pinned: Boolean!
  }

  input EditPlanTermInput {
    name: String
    year: Int
    term: Terms
    courses: [SelectedCourseInput!]
    customCourses: [CustomCourseInput!]
    hidden: Boolean
    status: Status
    pinned: Boolean
  }

  type Query {
    """
    Takes in user's email and returns their entire plan
    """
    planByUser: [Plan!]! @auth
  }

  type Mutation {
    """
    Takes in user's email, a college, majors, and minors, creates a new Plan record in the database, and returns the Plan
    """
    createNewPlan(college: Colleges!, startYear: Int!, endYear: Int!, majors: [String!]!, minors: [String!]!): Plan @auth

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
    editPlanTerm(id: ID!, planTerm: EditPlanTermInput!): PlanTerm @auth
    
    """
    For the planTerm specified by the term, modifies the courses field, and returns the updated 
    planTerm.
    """
    setSelectedCourses(id: ID!, courses: [SelectedCourseInput!]!, customCourses: [CustomCourseInput!]!): PlanTerm @auth

    """
    Deletes plan, for testing purposes
    """
    deletePlan: String @auth
  }
`;

export default typeDef;
