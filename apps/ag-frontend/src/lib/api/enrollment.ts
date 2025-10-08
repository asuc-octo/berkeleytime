import { gql } from "@apollo/client";

export interface ISeatReservationType {
  number: number;
  requirementGroup: string;
  fromDate: string;
}

export enum EnrollmentStatus {
  Closed = "C",
  Open = "O",
}

export interface ISeatReservationCount {
  number: number;
  maxEnroll: number;
  enrolledCount: number;
}

export interface IEnrollmentSingular {
  time: string;
  status: EnrollmentStatus;
  enrolledCount: number;
  reservedCount: number;
  waitlistedCount: number;
  minEnroll: number;
  maxEnroll: number;
  maxWaitlist: number;
  openReserved: number;
  instructorAddConsentRequired: boolean;
  instructorDropConsentRequired: boolean;
  seatReservationCounts: ISeatReservationCount[];
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

  seatReservationTypes: ISeatReservationType[];
  history: IEnrollmentSingular[];
  latest: IEnrollmentSingular;
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
        time
        status
        enrolledCount
        reservedCount
        waitlistedCount
        minEnroll
        maxEnroll
        maxWaitlist
        openReserved
        seatReservationCounts {
          number
          maxEnroll
          enrolledCount
        }
      }
    }
  }
`;
