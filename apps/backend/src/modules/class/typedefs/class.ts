import { gql } from "graphql-tag";

export default gql`
  scalar ClassNumber

  type Query {
    class(
      year: Int!
      semester: Semester!
      sessionId: SessionIdentifier
      subject: String!
      courseNumber: CourseNumber!
      number: ClassNumber!
    ): Class
    section(
      year: Int!
      semester: Semester!
      sessionId: SessionIdentifier
      subject: String!
      courseNumber: CourseNumber!
      number: SectionNumber!
    ): Section
  }

  type Class {
    "Identifiers"
    termId: TermIdentifier!
    sessionId: SessionIdentifier!
    courseId: String!
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!

    "Relationships"
    term: Term!
    course: Course!
    primarySection: Section!
    sections: [Section!]!
    gradeDistribution: GradeDistribution!
    aggregatedRatings: AggregatedRatings!

    "Attributes"
    year: Int!
    semester: Semester!
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

    "Clinic"
    CNC

    "Law"
    LAW

    ""
    LW1
  }

  scalar SectionNumber
  scalar SectionIdentifier

  type Section {
    "Identifiers"
    termId: TermIdentifier!
    sessionId: SessionIdentifier!
    sectionId: SectionIdentifier!

    "Relationships"
    term: Term!
    course: Course!
    class: Class!
    enrollment: Enrollment
    reservations: [Reservation!]

    "Attributes"
    year: Int!
    semester: Semester!
    subject: String!
    courseNumber: CourseNumber!
    classNumber: ClassNumber!
    number: SectionNumber!
    startDate: String!
    endDate: String!
    primary: Boolean!
    instructionMode: String!
    component: Component!
    meetings: [Meeting!]!
    exams: [Exam!]!
    online: Boolean!
    attendanceRequired: Boolean
    lecturesRecorded: Boolean
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

    "Conversation"
    CON
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
    location: String
    type: ExamType!
  }

  enum ExamType {
    "Final"
    FIN

    "Midterm"
    MID

    ALT

    MAK
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
