import { gql } from "graphql-tag";

export default gql`
  scalar TermId
  scalar SessionId
  scalar SectionId

  type Query {
    enrollment(
      termId: TermId!
      sessionId: SessionId!
      sectionId: SectionId!
    ): Enrollment!
  }

  type Enrollment {
    "Identifiers"
    termId: TermId!
    sessionId: SessionId!
    sectionId: SectionId!

    "Attributes"
    seatReservationTypes: [SeatReservationType!]!
    history: [EnrollmentHistory!]!
  }

  type SeatReservationType {
    number: Int!
    requirementGroup: String!
    fromDate: String!
  }

  type EnrollmentHistory {
    time: String!
    status: String!
    enrolledCount: Int!
    reservedCount: Int!
    waitlistedCount: Int!
    minEnroll: Int!
    maxEnroll: Int!
    maxWaitlist: Int!
    openReserved: Int!
    instructorAddConsentRequired: Boolean
    instructorDropConsentRequired: Boolean
    seatReservationCounts: [SeatReservationCount!]!
  }

  type SeatReservationCount {
    number: Int!
    maxEnroll: Int!
    enrolledCount: Int!
  }
`;
