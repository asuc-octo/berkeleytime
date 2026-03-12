import { gql } from "graphql-tag";

export const waitlistTypeDef = gql`
  """
  Section identifiers used to estimate drop rate (lambda) from enrollment history.
  """
  input WaitlistSectionInput {
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier
    subject: String!
    courseNumber: CourseNumber!
    sectionNumber: SectionNumber!
  }

  """
  Result of the Poisson waitlist "get in" probability calculation.
  """
  type WaitlistGetInProbability {
    "Probability of getting in from the waitlist (0-1)."
    probability: Float!
    "Lambda (drops per day) used in the calculation."
    lambdaUsed: Float
  }

  type Query {
    """
    Probability of getting in from waitlist position k before time T runs out,
    assuming drops follow a Poisson process. Provide lambda (drops per day) and/or
    section to estimate lambda from that section's enrollment history.
    """
    waitlistGetInProbability(
      "Waitlist position (1 = first on waitlist)."
      k: Int!
      "Time remaining in days."
      timeRemainingDays: Float!
      "Average drop rate per day. If omitted, provide section to estimate from history or a default is used."
      lambda: Float
      "Section to estimate lambda from enrollment history (optional)."
      section: WaitlistSectionInput
    ): WaitlistGetInProbability!
  }
`;
