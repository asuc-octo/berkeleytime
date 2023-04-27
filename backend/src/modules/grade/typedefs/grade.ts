import { gql } from "graphql-tag";

export default gql`
  type Grade @cacheControl(maxAge: 60 * 60 * 24 * 2) {
    average: Float
    distribution: [GradeDistributionItem]
  }

  type GradeDistributionItem @cacheControl(inheritMaxAge: true) {
    letter: String!
    count: Int!
  }

  type Query {
    grade(subject: String!, courseNum: String!, classNum: String, term: TermInput): Grade
  }
`;
