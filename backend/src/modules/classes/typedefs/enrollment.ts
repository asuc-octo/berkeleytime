import { gql } from "graphql-tag";

const typedef = gql`
  type Enrollment {
    classId: String!
    enrollmentInfo: [EnrollmentInfo]
  }

  type EnrollmentInfo {
    enrolledCount: Int
    date: String
  }

  type Query {
    Enrollment: [Enrollment]
    EnrollmentById(classId: String!): Enrollment
  }
`;

export default typedef;
