import { gql } from "@apollo/client";
import { GetGradeDistributionQuery } from "../generated/graphql";

export type Grade = NonNullable<NonNullable<GetGradeDistributionQuery["grade"]>["distribution"]>[number];

export type GradeDistribution = GetGradeDistributionQuery["grade"];

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
