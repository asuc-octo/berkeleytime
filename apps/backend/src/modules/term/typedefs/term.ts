import { gql } from "graphql-tag";

const typedef = gql`
  enum Semester {
    Summer
    Fall
    Spring
    Winter
  }

  enum TemporalPosition {
    "All past terms."
    Past

    "The current term. "
    Current

    "The future terms. Usually only includes the immediate next term."
    Future
  }

  enum AcademicCareerCode {
    "Graduate"
    GRAD

    "Law"
    LAW

    "UC Berkeley Extension"
    UCBX

    "Undergraduate"
    UGRD
  }

  "Unique session identifier within a term. Maps to session.id"
  scalar SessionIdentifier

  """
  Session, for example Summer Session A
  """
  type Session {
    "Identifiers"
    id: SessionIdentifier!

    "Attributes"
    temporalPosition: TemporalPosition!
    name: String!
    startDate: String!
    endDate: String!
    enrollBeginDate: String
    enrollEndDate: String
  }

  "Unique term identifier. Maps to term.id"
  scalar TermIdentifier

  """
  Term
  """
  type Term {
    "Identifiers"
    id: TermIdentifier!
    academicCareerCode: AcademicCareerCode!

    "Attributes"
    temporalPosition: TemporalPosition!
    year: Int!
    semester: Semester!
    startDate: String!
    endDate: String!
    selfServiceEnrollBeginDate: String
    selfServiceEnrollEndDate: String
    sessions: [Session!]
  }

  type Query {
    """
    Query for terms.
    """
    terms: [Term!]!

    """
    Query for a term.
    """
    term(year: Int!, semester: Semester!): Term
  }
`;

export default typedef;
