import { gql } from "graphql-tag";

export default gql`
  type Query {
    enrollment(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: CourseNumber!
      number: SectionNumber!
    ): Section!
  }
`;
