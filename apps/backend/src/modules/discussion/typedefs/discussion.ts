import { gql } from "graphql-tag";

export default gql`
    scalar courseNumber

    type Query {
        discussions(courseNumber:courseNumber!): Discussion
    }

    type Post {
        userId: String!
        PostTime: String!
        PostContent: String!
    }

    type Discussion {
        courseNumber: courseNumber!
        posts: [Post!]
    }

    type Mutation {
        post(courseNumber: courseNumber!, PostContent: String!): Post! @auth
    }

`;