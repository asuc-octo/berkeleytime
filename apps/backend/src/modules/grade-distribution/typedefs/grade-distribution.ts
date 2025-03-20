import { gql } from "graphql-tag";

export default gql`
  type GradeDistribution @cacheControl(maxAge: 1) {
    average: Float
    distribution: [Grade!]
  }

  type Grade @cacheControl(maxAge: 1) {
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
