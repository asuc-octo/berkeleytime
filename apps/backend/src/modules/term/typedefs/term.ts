import { gql } from "graphql-tag";

const typedef = gql`
  enum Semester {
    Summer
    Fall
    Spring
    Winter
  }

  enum TemporalPosition {
    Past
    Current
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
    temporalPosition: TemporalPosition!
    id: SessionIdentifier!
    name: String!
    beginDate: String!
    endDate: String!
  }

  "Unique term identifier. Maps to term.id"
  scalar TermIdentifier

  """
  Term
  """
  type Term {
    temporalPosition: TemporalPosition!
    id: TermIdentifier!
    academicCareerCode: AcademicCareerCode!
    name: String!
    beginDate: String!
    endDate: String!
    sessions: [Session!]!
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
