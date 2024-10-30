import { gql } from "graphql-tag";

const typedef = gql`
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
    metricName: String!
    descriptor: String!
    count: Int!
    mean: Int!
    categories: [Category!]!
}
type Category {
    value: Int!
    count: Int!
}
type Rating {
    "Class identifer"
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    class: String!

    createdBy: String!

    metricName: String!
    value: Int!
}
type ClassIdentifier {
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    class: String!
}
type Query {
    aggregatedRatings(class: ClassIdentifier!, isAllTime: Boolean!): AggregatedRatings!
    userRatings(subject: String!, number: String!): [Rating!]! @auth
}
type RatingIdentifier {
    "Class Identifers"
    subject: String!
    courseNumber: String!
    semester: Semester!
    year: Int!
    class: String!

    "User(google_id) & Metrics Identifers"
    createdBy: String!
    metricName: String!
}
type Mutation {
    createRating(rating: RatingIdentifier!, value: Int!): AggregatedRatings! @auth
    deleteRating(rating: RatingIdentifier!): AggregatedRatings! @auth
}
`;

export default typedef;