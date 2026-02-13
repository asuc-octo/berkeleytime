import { gql } from "@apollo/client";

export interface CourseLookupResult {
  courseId: string;
  subject: string;
  number: string;
  title: string;
}

export const COURSE_LOOKUP = gql`
  query CourseLookup($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      subject
      number
      title
    }
  }
`;
