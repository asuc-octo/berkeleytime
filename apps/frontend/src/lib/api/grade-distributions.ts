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
    $subject: String!
    $courseNumber: CourseNumber!
    $classNumber: ClassNumber
    $year: Int
    $semester: Semester
    $givenName: String
    $familyName: String
  ) {
    grade(
      subject: $subject
      courseNumber: $courseNumber
      classNumber: $classNumber
      year: $year
      semester: $semester
      givenName: $givenName
      familyName: $familyName
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
