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
    seatReservationTypes: [ReservationType!]
  }
    
  type ReservationType {
    number: Int!
    requirementGroup: String!
    fromDate: String!
  }

  type EnrollmentSingular {
    time: String!
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
    seatReservationCounts: [SeatReservationCounts!]
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
