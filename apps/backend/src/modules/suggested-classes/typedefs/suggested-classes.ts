import {gql} from "graphql-tag";

const typedef = gql`

    scalar UUID
    scalar Semester
    scalar CourseNumber

    type Post {
        id: UUID!
        semester: Semester!
        year: Int!
        sessionId: String!
        courseNumber: CourseNumber!
        number: Int!
        subject: String!
        image: String!
        text: String!
    }

    type Query {
        getAllPosts: [Post!]!
        getPost(postId: UUID!): Post
    }

    input CreatePostInput {
        id: UUID!
        semester: Semester!
        year: Int!
        sessionId: String!
        courseNumber: CourseNumber!
        number: Int!
        subject: String!
        image: String!
        text: String!
    }
    
    input UpdatePostInput {
        courseNumber: CourseNumber!
    }

    type Mutation {
        addPost(post: CreatePostInput!): Post
        modifyPost(post: UpdatePostInput!): Post
        deletePost(courseNumber: CourseNumber!): Int
    }   
`;

export default typedef;