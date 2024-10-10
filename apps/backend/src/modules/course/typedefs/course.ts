import { gql } from "graphql-tag";

export default gql`
  type Query {
    course(subject: String!, courseNumber: String!): Course
    courses: [Course!]!
  }

  type Course {
    "Identifiers"
    subject: String!
    number: String!

    "Relationships"
    classes: [Class!]!
    crossListing: [Course!]!
    requiredCourses: [Course!]!

    "Attributes"
    requirements: String
    description: String!
    fromDate: String!
    gradeAverage: Float
    gradingBasis: CourseGradingBasis!
    finalExam: CourseFinalExam
    academicCareer: AcademicCareer!
    title: String!
    primaryInstructionMethod: InstructionMethod!
    toDate: String!
    typicallyOffered: [String!]
  }

  enum CourseGradingBasis {
    completedNotation
    passFail
    letter
    satisfactory
    graded
  }

  enum CourseFinalExam {
    "To be decided by the instructor when the class is offered"
    D

    "No final exam"
    N

    "Alternative method of final assessment"
    A

    "Common Final Exam"
    C

    "Written final exam conducted during the scheduled final exam period"
    Y
  }

  enum AcademicCareer {
    "Undergraduate"
    UGRD

    "Graduate"
    GRAD

    "UC Extension"
    UCBX
  }

  enum InstructionMethod {
    "Unknown"
    UNK

    "Demonstration"
    DEM

    "Conversation"
    CON

    "Workshop"
    WOR

    "Web-Based Discussion"
    WBD

    "Clinic"
    CLC

    "Directed Group Study"
    GRP

    "Discussion"
    DIS

    "Tutorial"
    TUT

    "Field Work"
    FLD

    "Lecture"
    LEC

    "Laboratory"
    LAB

    "Session"
    SES

    "Studio"
    STD

    "Self-paced"
    SLF

    "Colloquium"
    COL

    "Web-Based Lecture"
    WBL

    "Independent Study"
    IND

    "Internship"
    INT

    "Reading"
    REA

    "Recitation"
    REC

    "Seminar"
    SEM
  }
`;
