import { gql } from "graphql-tag";

export default gql`
  type GradeDistribution {
    average: Float
    distribution: [Grade!]
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
      courseNumber: CourseNumber!
      classNumber: ClassNumber
      familyName: String
      givenName: String
    ): GradeDistribution!
  }
`;
