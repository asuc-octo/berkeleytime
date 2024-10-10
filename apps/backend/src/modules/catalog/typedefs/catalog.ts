import { gql } from "graphql-tag";

export default gql`
  type Query {
    catalog(term: TermInput!): [Course!]!
  }
`;
