import { gql } from "apollo-server-express";

//super basic schema for testing lmao
const typedef = gql`
  type Grade {
      course_id: String!,
  }
  
  type Query {
    grades: [Grade]
  }
`;

export default typedef;
