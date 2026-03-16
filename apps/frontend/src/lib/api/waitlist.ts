import { gql } from "@apollo/client";

export const GET_WAITLIST_PROBABILITY = gql`
  query GetWaitlistProbability(
    $k: Int!
    $timeRemainingDays: Float!
    $section: WaitlistSectionInput
  ) {
    waitlistGetInProbability(
      k: $k
      timeRemainingDays: $timeRemainingDays
      section: $section
    ) {
      probability
      lambdaUsed
    }
  }
`;
