import { gql } from "graphql-tag";

// TODO: section id link
const typedef = gql`
  type Enrollment {
    classId: String!
    enrollmentInfo: [EnrollmentInfo]
  }

  type EnrollmentInfo {
    enrolledCount: Int
    enrolledMax: Int
    waitlistedCount: Int
    waitlistedMax: Int
    date: String
  }

  type Query {
    Enrollment(classId: String!): Enrollment
  }
`;

export default typedef;
