import { gql } from "graphql-tag";

export const courseTypeDef = gql`
  scalar CourseIdentifier
  scalar CourseNumber

  type Query {
    course(subject: String!, number: CourseNumber!): Course
    courses: [Course!]!
  }

  type Course {
    "Identifiers"
    courseId: CourseIdentifier!
    subject: String!
    number: CourseNumber!

    "Relationships"
    classes: [Class!]!
    crossListing: [Course!]!
    requiredCourses: [Course!]!
    aggregatedRatings(metricNames: [MetricName!]): AggregatedRatings!
    instructorAggregatedRatings: [InstructorRating!]!
    gradeDistribution: GradeDistribution!
    ratingsCount: Int!

    "Attributes"
    requirements: String
    description: String!
    fromDate: String!
    gradingBasis: CourseGradingBasis!
    finalExam: CourseFinalExam
    academicCareer: AcademicCareer!
    academicOrganization: String
    academicOrganizationName: String
    departmentNicknames: String
    title: String!
    primaryInstructionMethod: InstructionMethod!
    toDate: String!
    typicallyOffered: [String!]
  }

  enum CourseGradingBasis {
    BMT
    CNC
    GRD
    IOP
    LAW
    OPT
    PNP
    SUS
    TRN
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

    "Last class meeting"
    L
  }

  enum AcademicCareer {
    "Undergraduate"
    UGRD

    "Graduate"
    GRAD

    "UC Extension"
    UCBX

    "Law"
    LAW
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

    "Clinic"
    CLN

    "Practicum"
    PRA
  }
`;
