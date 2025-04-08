import {gql} from "graphql-tag";

const typedef = gql`

    type Post {
        semester: String!
        year: Int!
        sessionId: String!
        courseNumber: Int!
        number: Int!
        subject: String!
        julianaInfo: JulianaInfo!
    }

    type JulianaInfo {
        image: String!
        text: String!
    }

    type Query {
        getAllPosts: [Post!]!
    }

    input CreatePostInput {
        semester: String!
        year: Int!
        sessionId: String!
        courseNumber: Int!
        number: Int!
        subject: String!
        julianaInfo: JulianaInfo!
    }
    
    input UpdatePostInput {
        courseNumber: Int!
    }

    type Mutation {
        addPost(post: CreatePostInput): Post
        modifyPost(sost: UpdatePostInput!): Post
        deletePost(courseNumber: Int!: Int
    }   
`;

export default typedef;