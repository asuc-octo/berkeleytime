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

  type Enrollment @cacheControl(maxAge: 3600) {
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
    seatReservationTypes: [ReservationType!]
  }

  type ReservationType {
    number: Int!
    requirementGroup: String!
    fromDate: String!
  }

  type EnrollmentSingular {
    startTime: String!
    endTime: String!
    granularitySeconds: Int!
    status: EnrollmentStatus
    enrolledCount: Int!
    reservedCount: Int!
    waitlistedCount: Int!
    minEnroll: Int
    maxEnroll: Int!
    maxWaitlist: Int!
    openReserved: Int!
    instructorAddConsentRequired: Boolean
    instructorDropConsentRequired: Boolean
    seatReservationCount: [SeatReservationCounts!]
  }

  type SeatReservationCounts {
    number: Int!
    maxEnroll: Int!
    enrolledCount: Int!
  }

  enum EnrollmentStatus {
    "Closed"
    C

    "Open"
    O
  }
`;
