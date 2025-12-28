import { gql } from "graphql-tag";

export const catalogTypeDef = gql`
  type Query {
    catalog(year: Int!, semester: Semester!): [Class!]!
  }
`;
