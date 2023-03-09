import { gql } from "graphql-tag";

export default gql`
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