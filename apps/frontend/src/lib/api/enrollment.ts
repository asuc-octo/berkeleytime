import { gql } from "@apollo/client";

export enum EnrollmentStatus {
  Closed = "C",
  Open = "O",
}

export interface IEnrollmentSingular {
  startTime: string;
  endTime: string;
  granularitySeconds: number;
  status: EnrollmentStatus;
  enrolledCount: number;
  waitlistedCount: number;
  minEnroll: number;
  maxEnroll: number;
  maxWaitlist: number;
  instructorAddConsentRequired: boolean;
  instructorDropConsentRequired: boolean;

  // lowkey dont need reservation count for entire class if we have individual seat reservations
  seatReservationCount: ISeatReservationCounts[];
}

export interface IEnrollment {
  termId: string;
  year: number;
  semester: string;
  sessionId: string;
  sectionId: string;
  subject: string;
  courseNumber: string;
  sectionNumber: string;
  history: IEnrollmentSingular[];
  latest: IEnrollmentSingular;
  seatReservationTypes: IReservationType[];
}

export interface ISeatReservationCounts {
  number: number;
  maxEnroll: number;
  enrolledCount: number;
}

export interface IReservationType {
  number: number;
  requirementGroup: string;
  fromDate: string;
}

export interface ReadEnrollmentResponse {
  enrollment: IEnrollment;
}

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
