import { gql } from "graphql-tag";

export default gql`
  """
  Cached for 48 hours.
  """
  type Grade @cacheControl(maxAge: 172800) {
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
