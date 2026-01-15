// TODO: Write major prereq
import { gql } from "graphql-tag";

export const planTypeDef = gql`
  enum Terms {
    Fall
    Spring
    Summer
    Misc
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
  type MajorReq @cacheControl(maxAge: 0) {
    name: String!
    major: String!
    numCoursesRequired: Int!
    satisfyingCourseIds: [String!]!
    isMinor: Boolean!
  }

  type Label @cacheControl(maxAge: 0) {
    name: String!
    color: String!
  }

  """
  PlanRequirement: Stores BtLL code for evaluating requirements
  """
  type PlanRequirement @cacheControl(maxAge: 0) {
    _id: ID!
    code: String!
    isUcReq: Boolean!
    college: String
    major: String
    minor: String
    createdBy: String!
    isOfficial: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  """
  SelectedPlanRequirement: Links a PlanRequirement to a Plan with met status tracking
  """
  type SelectedPlanRequirement @cacheControl(maxAge: 0) {
    planRequirementId: ID!
    planRequirement: PlanRequirement!
    """
    Manual overrides: when user manually checks off a requirement.
    null = use evaluated value, true = manually marked as met, false = manually marked as not met
    """
    manualOverrides: [Boolean]!
  }

  type Plan @cacheControl(maxAge: 0) {
    _id: ID!
    userEmail: String!
    planTerms: [PlanTerm!]!
    majorReqs: [MajorReq!]!
    majors: [String!]!
    minors: [String!]!
    created: String!
    revised: String!
    colleges: [Colleges!]!
    labels: [Label!]!
    """
    Requirements manually satisfied
    """
    uniReqsSatisfied: [UniReqs!]!
    collegeReqsSatisfied: [CollegeReqs!]!
    """
    Selected plan requirements with met status tracking
    """
    selectedPlanRequirements: [SelectedPlanRequirement!]!
  }

  type PlanTerm @cacheControl(maxAge: 0) {
    _id: ID!
    name: String!
    userEmail: String!
    year: Int!
    term: Terms!
    courses: [SelectedCourse!]!
    hidden: Boolean!
    status: Status!
    pinned: Boolean!
  }

  type SelectedCourse @cacheControl(maxAge: 0) {
    """
    Identifiers (probably cs-course-ids) for the classes the user has added to their schedule.
    """
    courseID: String!
    courseName: String!
    courseTitle: String!
    courseUnits: Int!
    uniReqs: [UniReqs!]!
    collegeReqs: [CollegeReqs!]!
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

  input SelectedCourseInput {
    courseID: String!
    courseName: String!
    courseTitle: String!
    courseUnits: Int!
    uniReqs: [UniReqs!]!
    collegeReqs: [CollegeReqs!]!
    pnp: Boolean!
    transfer: Boolean!
    labels: [LabelInput!]!
  }

  input PlanInput {
    colleges: [Colleges!]
    majors: [String!]
    minors: [String!]
    majorReqs: [MajorReqInput!]
    labels: [LabelInput!]
    uniReqsSatisfied: [UniReqs!]
    collegeReqsSatisfied: [CollegeReqs!]
    selectedPlanRequirements: [SelectedPlanRequirementInput!]
  }

  input PlanTermInput {
    name: String!
    year: Int!
    term: Terms!
    courses: [SelectedCourseInput!]!
    hidden: Boolean!
    status: Status!
    pinned: Boolean!
  }

  input EditPlanTermInput {
    name: String
    year: Int
    term: Terms
    courses: [SelectedCourseInput!]
    hidden: Boolean
    status: Status
    pinned: Boolean
  }

  input SelectedPlanRequirementInput {
    planRequirementId: ID!
    manualOverrides: [Boolean]!
  }

  input UpdateManualOverrideInput {
    planRequirementId: ID!
    """
    Index of the requirement to update
    """
    requirementIndex: Int!
    """
    null to clear override, true/false to set manual override
    """
    manualOverride: Boolean
  }

  """
  GradTrak analytics data point for treemap visualization
  """
  type GradTrakAnalyticsDataPoint @cacheControl(maxAge: 0) {
    planId: ID!
    userEmail: String!
    majors: [String!]!
    minors: [String!]!
    colleges: [String!]!
    totalCourses: Int!
    startYear: Int
    createdAt: String!
  }

  type Query {
    """
    Takes in user's email and returns their entire plan
    """
    planByUser: [Plan!]! @auth

    """
    Get PlanRequirements by majors and minors.
    Returns all matching PlanRequirement documents for the given majors and minors.
    """
    planRequirementsByMajorsAndMinors(
      majors: [String!]!
      minors: [String!]!
    ): [PlanRequirement!]!

    """
    Get UC requirements (isUcReq = true)
    """
    ucRequirements: [PlanRequirement!]!

    """
    Get college requirements by college name
    """
    collegeRequirements(college: String!): [PlanRequirement!]!
  }

  type Mutation {
    """
    Takes in user's email, a college, majors, and minors, creates a new Plan record in the database, and returns the Plan
    """
    createNewPlan(
      colleges: [Colleges!]!
      startYear: Int!
      endYear: Int!
      majors: [String!]!
      minors: [String!]!
    ): Plan @auth

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
    setSelectedCourses(id: ID!, courses: [SelectedCourseInput!]!): PlanTerm
      @auth

    """
    Deletes plan, for testing purposes
    """
    deletePlan: String @auth

    """
    Update a manual override for a specific requirement in a SelectedPlanRequirement.
    Used when user manually checks off a requirement.
    """
    updateManualOverride(input: UpdateManualOverrideInput!): Plan @auth

    """
    Update all selectedPlanRequirements for the user's plan.
    Used when re-evaluating requirements or initializing them.
    """
    updateSelectedPlanRequirements(
      selectedPlanRequirements: [SelectedPlanRequirementInput!]!
    ): Plan @auth
  }
`;
