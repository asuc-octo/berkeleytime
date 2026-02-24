import { gql } from "graphql-tag";

export const datapullerTypeDef = gql`
  enum DatapullerJob {
    TERMS_ALL
    TERMS_NEARBY
    COURSES
    SECTIONS_ACTIVE
    SECTIONS_LAST_FIVE_YEARS
    CLASSES_ACTIVE
    CLASSES_LAST_FIVE_YEARS
    GRADES_RECENT
    GRADES_LAST_FIVE_YEARS
    ENROLLMENTS
    ENROLLMENT_TIMEFRAME
  }

  type TriggerDatapullerResult {
    jobName: String!
    success: Boolean!
    message: String
  }

  extend type Mutation {
    """
    Manually trigger a datapuller job by creating a Kubernetes Job from the
    corresponding CronJob. Staff-only.
    """
    triggerDatapuller(job: DatapullerJob!): TriggerDatapullerResult! @auth
  }
`;
