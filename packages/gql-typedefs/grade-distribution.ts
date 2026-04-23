import { gql } from "graphql-tag";

export const gradeDistributionTypeDef = gql`
  type GradeDistribution {
    average: Float
    distribution: [Grade!]
    pnpPercentage: Float
  }

  type Grade {
    letter: String!
    percentage: Float!
    count: Int!
  }

  type Query {
    grade(
      year: Int
      semester: Semester
      sessionId: SessionIdentifier
      subject: String!
      courseId: String!
      classNumber: ClassNumber
      familyName: String
      givenName: String
    ): GradeDistribution!
  }
`;
