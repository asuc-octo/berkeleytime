import { gql } from "graphql-tag";

const typedef = gql`
  enum Semester {
    # Summer
    S

    # Fall
    F

    # Spring
    P

    # Winter
    W
  }

  """
  Term
  """
  type Term {
    semester: Semester!
    year: String!
    active: Boolean!
  }

  type Query {
    """
    Query for terms.
    """
    terms: [Term]
  }
`;

export default typedef;
