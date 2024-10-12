import { gql } from "graphql-tag";

const typedef = gql`
  enum Semester {
    # Summer
    Summer

    # Fall
    Fall

    # Spring
    Spring

    # Winter
    Winter
  }

  enum TemporalPosition {
    # Past
    Past

    # Current
    Current

    # Future
    Future
  }

  """
  Session
  """
  type Session {
    temporalPosition: TemporalPosition!
    # id: Int!
    name: String!
    startDate: String
    endDate: String
  }

  """
  Term
  """
  type Term {
    semester: Semester!
    year: Int!
    temporalPosition: TemporalPosition!
    startDate: String!
    endDate: String!
    sessions: [Session!]!
  }

  type Query {
    """
    Query for terms.
    """
    terms: [Term]

    """
    Query for a term.
    """
    term(year: Int!, semester: Semester!): Term
  }
`;

export default typedef;
