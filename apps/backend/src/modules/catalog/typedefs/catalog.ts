import { gql } from "graphql-tag";

export default gql`
  type CatalogConnection {
    classes: [Class!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type Query {
    catalog(
      year: Int!
      semester: Semester!
      limit: Int
      offset: Int
    ): CatalogConnection!
  }
`;
