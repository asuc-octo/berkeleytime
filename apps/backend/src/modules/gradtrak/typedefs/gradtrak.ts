// TODO: Write major prereq
import { gql } from "graphql-tag";

const typeDef = gql`
  type GqlTerm {
    year: Int!
    planTerm: String!
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

  enum Uni_Reqs {
    AC
    AH
    AI
    CW
    QR
    RCA
    RCB
  }
  enum College_Reqs {
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

  type Major_Req {
    name: String!
    major: String!
    num_courses_required: Int!
    satisfying_course_ids: [String!]
  }

  type Gradtrak {
    user_email: String!
    planTerms: [PlanTerm!]
    miscellaneous: PlanTerm!
    uni_reqs: [String!]
    college_reqs: [String!]
    major_reqs: [Major_Req!]
    created: String!
    revised: String!
  }

  type PlanTerm {
    _id: ID
    name: String
    user_email: String!
    term: GqlTerm
    courses: [SelectedCourse!]
    custom_events: [CustomEvent!]
  }

  type SelectedCourse {
    """
    Identifiers (probably cs-course-ids) for the classes the user has added to their schedule.
    """
    class_ID: String!
    """
    Identifiers (probably the "003" in "2022 Spring STAT 97 003") for the primary sections (typically lectures) the user has added to their schedule.
    """
    primary_section_ID: String
    """
    Identifiers (probably the "103" in "103 DIS") for the secondary sections (typically discussions) the user has added to their schedule.
    """
    secondary_section_IDs: [String!]
    """
    Requirements satisfied by class
    """
    uni_reqs: [String!]
    college_reqs: [String!]
  }

  type CustomEvent {
    start_time: String!
    end_time: String!
    title: String
    location: String
    description: String
    days_of_week: String
    uni_reqs: [String!]
    college_reqs: [String!]
  }

  input MajorReqInput {
    name: String!
    major: String!
    num_courses_required: Int!
    satisfying_course_ids: [String!]!
  }

  input GqlTermInput {
    year: Int!
    planTerm: String!
  }

  input CustomEventInput {
    start_time: String!
    end_time: String!
    title: String
    location: String
    description: String
    days_of_week: String
    uni_reqs: [Uni_Reqs!]
    college_reqs: [College_Reqs!]
  }

  input SelectedCourseInput {
    class_ID: String!
    primary_section_ID: String
    secondary_section_IDs: [String!]
    uni_reqs: [Uni_Reqs!]
    college_reqs: [College_Reqs!]
  }

  input PlanTermInput {
    name: String
    term: GqlTermInput
    courses: [SelectedCourseInput!]
    custom_events: [CustomEventInput!]
  }

  type Query {
    """
    Takes in user's email and returns their entire gradtrak
    """
    gradtrakByUser: Gradtrak @auth
    
    """
    Takes in an ID and returns the planTerm for that term.
    """
    planTermByID(id: ID!): PlanTerm
  }

  type Mutation {
    """
    Takes in user's email, creates a new Gradtrak record in the database, and returns the Gradtrak
    """
    createNewGradtrak: Gradtrak @auth

    """
    Takes in a new college, switches the user's college requirements
    """
    changeGradtrakCollege(college: Colleges!): Gradtrak @auth

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
    setSelectedClasses(id: ID!, courses: [SelectedCourseInput!]!, custom_events: [CustomEventInput!]!): PlanTerm @auth

    """
    Edits the list of major requirements
    """
    editMajorRequirements(major_reqs: [MajorReqInput!]!): Gradtrak @auth

    """
    Deletes gradtrak, for testing purposes
    """
    deleteGradtrak: String @auth
  }
`;

export default typeDef;
