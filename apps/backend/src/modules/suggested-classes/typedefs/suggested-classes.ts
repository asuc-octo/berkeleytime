import {gql} from "graphql-tag";

const typedef = gql`

    type Post {
        semester: Semester!
        year: Int!
        sessionId: SectionIdentifier!
        courseNumber: Int!
        number: ClassNumber!
        subject: String!
        JulianaInfo: JulianaInfo!
    }

    type JulianaInfo {
        image: String!
        text: String!
    }

    type Query {
        getAllPosts: [Post!]!
    }

    type Mutation {
        addPost(
            semester: Semester!
            year: Int!
            sessionId: SectionIdentifier!
            courseNumber: Int!
            number: ClassNumber!
            subject: String!
            image: String!
            text: String!
        ): Post!
      }
`;

export default typedef;