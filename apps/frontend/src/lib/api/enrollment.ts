import { gql } from "@apollo/client";

export enum EnrollmentStatus {
  Closed = "C",
  Open = "O",
}

export interface IEnrollmentSingular {
  time: string;
  status: EnrollmentStatus;
  enrolledCount: number;
  waitlistedCount: number;
  minEnroll: number;
  maxEnroll: number;
  maxWaitlist: number;
  instructorAddConsentRequired: boolean;
  instructorDropConsentRequired: boolean;
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
      history {
        time
        status
        enrolledCount
        waitlistedCount
        minEnroll
        maxEnroll
        maxWaitlist
      }
    }
  }
`;
