import { gql } from "graphql-tag";

export default gql`
  type Query {
    enrollment(
      year: Int!
      semester: Semester!
      subject: String!
      courseNumber: String!
      number: String!
    ): Section!
  }
`;
