import { gql } from "graphql-tag";

export default gql`
directive @auth on OBJECT | FIELD_DEFINITION

scalar JSON
scalar JSONObject

scalar ISODate

"""
The combination of year and season that corresponds to a specific term. Both year and season/semester are required.
"""
input TermInput {
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
