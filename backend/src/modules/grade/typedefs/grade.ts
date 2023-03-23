import { gql } from "graphql-tag";

export default gql`
  type Grade {
    average: Float
    distribution: [GradeDistributionItem]
  }

  type GradeDistributionItem {
    letter: String!
    count: Int!
  }

  type Query {
    grade(subject: String!, courseNum: String!, classNum: String, term: Term): Grade
  }
`;
