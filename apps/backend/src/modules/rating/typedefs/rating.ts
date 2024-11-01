import { gql } from "graphql-tag";

const typedef = gql`
enum MetricName {
    Usefulness
    Difficulty
    Workload
    Attendance
    Recording
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
    mean: Float!
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
type ClassIdentifier {
    "Class identifer"
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    class: String!
}
type Query {
    aggregatedRatings(classIdentifier: ClassIdentifier!, isAllTime: Boolean!): AggregatedRatings!
    userRatings: UserRatings! @auth
}

"""
Modify data
"""
type RatingIdentifier {
    "Class Identifers"
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    class: String!

    metricName: MetricName!
}
type Mutation {
    createRating(rating: RatingIdentifier!, value: Int!): AggregatedRatings! @auth
    deleteRating(rating: RatingIdentifier!): AggregatedRatings! @auth
}
`;

export default typedef;