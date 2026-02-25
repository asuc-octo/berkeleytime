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

  type DatapullerJobStatus {
    jobName: String!
    phase: String!
    message: String
  }

  extend type Query {
    """
    get the current status of a manually triggered datapuller job
    """
    datapullerJobStatus(jobName: String!): DatapullerJobStatus! @auth
  }

  extend type Mutation {
    """
    manually trigger a datapuller job by creating a Kubernetes Job from the
    corresponding CronJob
    """
    triggerDatapuller(job: DatapullerJob!): TriggerDatapullerResult! @auth
  }
`;
