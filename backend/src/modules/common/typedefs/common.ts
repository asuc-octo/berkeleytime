import { gql } from "graphql-tag";

export default gql`
scalar JSON
scalar JSONObject

input Term {
    year: Int!
    semester: Semester!
}

enum Semester {
    Fall
    Spring
    Summer
}

type Query {
    ping: String!
}
`