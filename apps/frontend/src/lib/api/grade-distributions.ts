import { gql } from "@apollo/client";

export interface Grade {
  letter: string;
  percentage: number;
  count: number;
}

export interface GradeDistribution {
  average: number | null;
  distribution: Grade[];
}

export interface ReadGradeDistributionResponse {
  grade: GradeDistribution;
}

export const READ_GRADE_DISTRIBUTION = gql`
  query GetGradeDistribution(
    $year: Int
    $semester: Semester
    $sessionId: SessionIdentifier
    $subject: String!
    $courseNumber: CourseNumber!
    $classNumber: ClassNumber
    $familyName: String
    $givenName: String
  ) {
    grade(
      year: $year
      semester: $semester
      sessionId: $sessionId
      subject: $subject
      courseNumber: $courseNumber
      classNumber: $classNumber
      familyName: $familyName
      givenName: $givenName
    ) {
      average
      distribution {
        letter
        percentage
        count
      }
    }
  }
`;
