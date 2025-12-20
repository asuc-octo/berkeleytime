import { gql } from "graphql-tag";

export const statsTypeDef = gql`
  type UserStats  {
    totalCount: Int!
    createdLastWeek: Int!
    createdLastMonth: Int!
  }

  type SchedulerStats {
    uniqueUsersWithSchedules: Int!
  }

  type PlanCourseCount {
    planId: ID!
    totalCourses: Int!
  }

  type CourseHistogramBucket {
    range: String!
    count: Int!
  }

  type GradtrakStats {
    totalCourses: Int!
    maxCoursesInOnePlan: Int!
    topPlansWithMostCourses: [PlanCourseCount!]!
    courseHistogram: [CourseHistogramBucket!]!
  }

  type CourseWithMostRatings {
    subject: String!
    courseNumber: String!
    totalRatings: Int!
  }

  type ClassWithMostRatings {
    subject: String!
    courseNumber: String!
    semester: String!
    year: Int!
    classNumber: String!
    totalRatings: Int!
  }

  type RatingsStats {
    classesWithRatings: Int!
    courseWithMostRatings: CourseWithMostRatings
    classWithMostRatings: ClassWithMostRatings
    uniqueCreatedBy: Int!
  }

  type Stats @cacheControl(maxAge: 1) {
    users: UserStats!
    scheduler: SchedulerStats!
    gradtrak: GradtrakStats!
    ratings: RatingsStats!
  }

  type Query {
    stats: Stats!
  }
`;
