import { gql } from "graphql-tag";

export default gql`
  type Query {
    enrollment(
      year: Int!
      semester: Semester!
      sessionId: SessionIdentifier
      subject: String!
      courseNumber: CourseNumber!
      sectionNumber: SectionNumber!
    ): Enrollment
  }

  type Enrollment @cacheControl(maxAge: 300) {
    "Identifiers"
    termId: TermIdentifier!
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier!
    sectionId: SectionIdentifier!
    subject: String!
    courseNumber: CourseNumber!
    sectionNumber: SectionNumber!

    "Attributes"
    history: [EnrollmentSingular!]!
    latest: EnrollmentSingular
  }

  type EnrollmentSingular {
    time: String!
    status: EnrollmentStatus
    enrolledCount: Int!
    waitlistedCount: Int!
    minEnroll: Int
    maxEnroll: Int!
    maxWaitlist: Int!
    instructorAddConsentRequired: Boolean
    instructorDropConsentRequired: Boolean
  }

  enum EnrollmentStatus {
    "Closed"
    C

    "Open"
    O
  }
`;
