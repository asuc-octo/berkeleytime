import { gql } from "@apollo/client";

import { EnrollmentSingular, GetEnrollmentQuery } from "../generated/graphql";

export type IEnrollmentSingular = EnrollmentSingular;

export type IEnrollment = NonNullable<GetEnrollmentQuery["enrollment"]>;

export type ISeatReservationCounts = NonNullable<
  NonNullable<
    GetEnrollmentQuery["enrollment"]
  >["history"][number]["seatReservationCount"]
>[number];

export type IReservationType = NonNullable<
  NonNullable<GetEnrollmentQuery["enrollment"]>["seatReservationTypes"]
>[number];

export const READ_ENROLLMENT = gql`
  query GetEnrollment(
    $year: Int!
    $semester: Semester!
    $sessionId: SessionIdentifier
    $subject: String!
    $courseNumber: CourseNumber!
    $sectionNumber: SectionNumber!
  ) {
    enrollment(
      year: $year
      semester: $semester
      sessionId: $sessionId
      subject: $subject
      courseNumber: $courseNumber
      sectionNumber: $sectionNumber
    ) {
      year
      semester
      sessionId
      sectionId
      subject
      courseNumber
      sectionNumber
      seatReservationTypes {
        number
        requirementGroup
        fromDate
      }
      history {
        startTime
        endTime
        granularitySeconds
        status
        enrolledCount
        waitlistedCount
        reservedCount
        minEnroll
        maxEnroll
        maxWaitlist
        openReserved
        seatReservationCount {
          number
          maxEnroll
          enrolledCount
        }
      }
    }
  }
`;
