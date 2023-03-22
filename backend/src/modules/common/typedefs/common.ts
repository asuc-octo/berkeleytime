import { gql } from "graphql-tag";

export default gql`
scalar JSON
scalar JSONObject

scalar ISODate

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