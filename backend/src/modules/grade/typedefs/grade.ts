import { gql } from "graphql-tag";

export default gql`
  type Grade @cacheControl(maxAge: 1) {
    average: Float
    distribution: [GradeDistributionItem]
  }

  type GradeDistributionItem @cacheControl(maxAge: 1) {
    letter: String!
    count: Int!
  }

  type Query {
    grade(subject: String!, courseNum: String!, classNum: String, term: TermInput): Grade
  }
`;
