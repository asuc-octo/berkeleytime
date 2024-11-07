import { gql } from "graphql-tag";

export default gql`
  type GradeDistribution @cacheControl(maxAge: 1) {
    average: Float
    distribution: [Grade!]!
  }

  type Grade @cacheControl(maxAge: 1) {
    letter: String!
    count: Int!
  }

  type Query {
    grade(
      subject: String!
      courseNumber: CourseNumber!
      classNumber: ClassNumber
      year: Int
      semester: Semester
      givenName: String
      familyName: String
    ): GradeDistribution!
  }
`;
