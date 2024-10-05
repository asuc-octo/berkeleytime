import { gql } from "graphql-tag";

export default gql`
  type Query {
    course(subject: String!, courseNumber: String!, term: TermInput): Course
    class(
      subject: String!
      courseNumber: String!
      term: TermInput!
      classNumber: String!
    ): Class
    section(
      subject: String!
      courseNumber: String!
      term: TermInput!
      classNumber: String!
      sectionNumber: String!
    ): Section

    """
    Get info about all courses and their corresponding classes for a given semester.

    Used primarily in the catalog page.
    """
    catalog(term: TermInput!): [Course!]

    """
    Get a list of all course names across all semesters.

    Useful for searching for courses.
    """
    courseList: [Course!]
  }

  """
  Info shared between Classes within and across semesters.
  """
  type Course {
    classes(term: TermInput): [Class!]!
    crossListing: [Course!]!
    sections(term: TermInput, primary: Boolean): [Section!]!
    requiredCourses: [Course!]!

    requirements: String
    description: String!
    fromDate: String!
    gradeAverage: Float
    gradingBasis: CourseGradingBasis!
    finalExam: CourseFinalExam
    academicCareer: AcademicCareer!
    number: String!
    subject: String!
    title: String!
    primaryInstructionMethod: InstructionMethod!
    toDate: String!
    typicallyOffered: [String!]

    raw: JSONObject!
    lastUpdated: ISODate!
  }

  enum AcademicCareer {
    "Undergraduate"
    UGRD

    "Graduate"
    GRAD

    "UC Extension"
    UCBX
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

  enum CourseGradingBasis {
    completedNotation
    passFail
    letter
    satisfactory
    graded
  }

  """
  Data for a specific class in a specific semester. There may be more than one Class for a given Course in a given semester.
  """
  type Class {
    course: Course!
    primarySection: Section!
    sections: [Section!]!

    session: Session!
    gradingBasis: ClassGradingBasis!
    finalExam: ClassFinalExam!
    description: String
    title: String
    number: String!
    semester: Semester!
    year: Int!
    unitsMax: Float!
    unitsMin: Float!

    raw: JSONObject!
    lastUpdated: ISODate!
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

  enum Session {
    "Regular Academic Session"
    R

    "12-Week Summer Session"
    S

    "Session A"
    A

    "Session B"
    B

    "Session C"
    C

    "Session D"
    D

    "Session E"
    E

    "Session F"
    F
  }

  """
  Sections are each associated with one Class.
  """
  type Section {
    class: Class!
    course: Course!
    enrollmentHistory: [EnrollmentDay!]

    ccn: Int!
    number: String!
    primary: Boolean!

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

    raw: JSONObject!
    lastUpdated: ISODate!
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

  type CourseListItem {
    subject: String!
    number: String!
  }
`;
