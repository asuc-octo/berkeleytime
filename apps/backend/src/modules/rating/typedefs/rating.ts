import { gql } from "graphql-tag";

const typedef = gql`
enum MetricName {
    "Numerical metrics"
    Usefulness
    Difficulty
    Workload

    "Boolean metrics"
    Attendance
    Recording
}

enum Semester {
    Fall
    Spring
    Summer
    Winter
}

"""
Ratings by class
"""
type AggregatedRatings {
    "Class identifer"
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    class: String!

    metrics: [Metric!]!
}
type Metric {
    metricName: MetricName!
    count: Int!
    weightedAverage: Float!
    categories: [Category!]!
}
type Category {
    value: Int!
    count: Int!
}

"""
Ratings by user
"""
type UserRatings {
    createdBy: String!
    count: Int!
    classes: [UserClass!]!
}
type UserClass {
    "Class identifer"
    subject: String!
    courseNumber: String! 
    semester: Semester!
    year: Int!
    class: String!

    metrics: [UserMetric!]!
}
type UserMetric {
    metricName: MetricName!
    value: Int!
}

"""
Get data
"""
input ClassIdentifier {
    "Class identifer"
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    class: String!
}
type Query {
    aggregatedRatings(
        classIdentifier: ClassIdentifier!
        isAllTime: Boolean!
    ): AggregatedRatings!
    userRatings: UserRatings! @auth
}

"""
Modify data
"""
input RatingIdentifier {
    "Class Identifers"
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    class: String!

    metricName: MetricName!
}
type Mutation {
    createRating(
        rating: RatingIdentifier!
        value: Int!
    ): AggregatedRatings! @auth
    deleteRating(
        rating: RatingIdentifier!
    ): Boolean! @auth
}
`;

export default typedef;