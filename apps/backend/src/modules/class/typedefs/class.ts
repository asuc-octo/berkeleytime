import { gql } from "graphql-tag";

export default gql`
  type Query {
    class(
      term: TermInput!
      subject: String!
      courseNumber: String!
      classNumber: String!
    ): Class
    section(
      term: TermInput!
      subject: String!
      courseNumber: String!
      classNumber: String!
      sectionNumber: String!
    ): Section
  }

  type Class {
    "Identifiers"
    subject: String!
    courseNumber: String!
    number: String!

    "Term"
    year: Int!
    semester: Semester!
    session: String!

    "Relationships"
    course: Course!
    primarySection: Section!
    sections: [Section!]!
    term: Term!

    "Attributes"
    gradingBasis: ClassGradingBasis!
    finalExam: ClassFinalExam!
    description: String
    title: String
    unitsMax: Float!
    unitsMin: Float!
  }

  enum ClassFinalExam {
    "Yes"
    Y

    "No"
    N

    "Alernate Method"
    A

    "Common Final"
    C

    "Last Class Meeting"
    L
  }

  enum ClassGradingBasis {
    "Elective Satisfactory/Unsat"
    ESU

    "Satisfactory/Unsatisfactory"
    SUS

    "Student Option"
    OPT

    "Pass/Not Pass"
    PNP

    "Multi-Term Course: Not Graded"
    BMT

    "Graded"
    GRD

    "Instructor Option"
    IOP
  }

  type Section {
    "Identifiers"
    subject: String!
    courseNumber: String!
    classNumber: String!
    number: String!

    "Term"
    year: Int!
    semester: Semester!
    session: String!

    "Relationships"
    class: Class!
    course: Course!
    term: Term!

    "Attributes"
    ccn: Int!
    primary: Boolean!
    enrollmentHistory: [EnrollmentDay!]
    component: Component!
    meetings: [Meeting!]!
    exams: [Exam!]!
    startDate: String!
    endDate: String!
    online: Boolean!
    open: Boolean!
    reservations: [Reservation!]
    enrollCount: Int!
    waitlistCount: Int!
    enrollMax: Int!
    waitlistMax: Int!
  }

  enum Component {
    "Workshop"
    WOR

    "Web-Based Discussion"
    WBD

    "Clinic"
    CLN

    "Practicum"
    PRA

    "Directed Group Study"
    GRP

    "Discussion"
    DIS

    "Voluntary"
    VOL

    "Tutorial"
    TUT

    "Field Work"
    FLD

    "Lecture"
    LEC

    "Supplementary"
    SUP

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

    "Demonstration"
    DEM
  }

  type Reservation {
    enrollCount: Int!
    enrollMax: Int!
    group: String!
  }

  type Meeting {
    days: [Boolean!]
    startTime: String!
    endTime: String!
    startDate: String!
    endDate: String!
    location: String
    instructors: [Instructor!]!
  }

  type Exam {
    date: String!
    startTime: String!
    endTime: String!
    location: String!
    final: Boolean!
  }

  type Instructor {
    familyName: String
    givenName: String
  }

  type EnrollmentDay {
    enrollCount: Int!
    enrollMax: Int!
    waitlistCount: Int!
    waitlistMax: Int!
  }
`;
