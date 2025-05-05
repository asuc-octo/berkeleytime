import { gql } from "graphql-tag";

export default gql`
  type Query {
    decals(semester: String!, year: String!): [Decal!]!
  }

  type Decal {
    _id: ID!
    title: String
    description: String
    category: String
    units: String
    website: String
    application: String
    enroll: String
    contact: String
    subject: String
    courseNumber: CourseNumber
    semester: String
    year: String
    class: Class
  }
`;
