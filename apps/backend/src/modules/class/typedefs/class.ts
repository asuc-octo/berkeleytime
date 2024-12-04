import { gql } from "graphql-tag";


export default gql`
  scalar ClassNumber

  type Query {
    class(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: CourseNumber!
      number: ClassNumber!
    ): Class
    section(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: CourseNumber!
      classNumber: ClassNumber!
      number: SectionNumber!
    ): Section
  }

  type DecalInfo {
    id: Int
    title: String
    description: String
    category: String
    units: String
    website: String
    application: String
    enroll: String
    contact: String
  }

  type Class {
    "Identifiers"
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!
    year: Int!
    semester: Semester!
    session: String!

    "Relationships"
    course: Course!
    primarySection: Section!
    sections: [Section!]!
    term: Term!
    gradeDistribution: GradeDistribution!

    "Attributes"
    gradingBasis: ClassGradingBasis!
    finalExam: ClassFinalExam!
    description: String
    title: String
    unitsMax: Float!
    unitsMin: Float!
    decal: DecalInfo
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

  scalar SectionNumber
  scalar SectionIdentifier

  type Section {
    "Identifiers"
    subject: String!
    courseNumber: CourseNumber!
    classNumber: ClassNumber!
    number: SectionNumber!
    year: Int!
    semester: Semester!
    ccn: SectionIdentifier!

    "Relationships"
    class: Class!
    course: Course!
    term: Term!

    "Attributes"
    session: String!
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