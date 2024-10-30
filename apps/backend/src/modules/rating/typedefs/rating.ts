import { gql } from "graphql-tag";

const typedef = gql`
type HistogramEntry {
    value: Int!
    count: Int!
    class: String!
}
type ClassHistogram {
    class: Class
    histogram: [HistogramEntry!]
}
type RatingSummary {
    name: String!
    class_histogram: [ClassHistogram!]
    overall_histogram: [HistogramEntry!]
    totalCount: Int!
    average: Float!
}   
type Rating {
    class: Class!
    question: String!
    value: Int!
}
type Query {
    rating(name: String!, subject: String!, number: String!): RatingSummary!
    user_ratings(subject: String!, number: String!): [Rating] @auth
} 
type CreateRatingInput {
    class: String!
    question: String! 
    value: Int! 
}
type Mutation {
    createRating(rating: CreateRatingInput): RatingSummary! @auth
    deleteRating(subject: String!, number: String!): RatingSummary! @auth
}
`;

export default typedef;