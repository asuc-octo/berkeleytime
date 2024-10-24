import { gql } from "graphql-tag";

export default gql`
  type Query {
    catalog(year: Int!, semester: Semester!): [Course!]!
  }
`;
