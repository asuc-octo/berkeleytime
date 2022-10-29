import { gql } from "graphql-tag";

const typedef = gql`
  type Grade {
    APlus: LetterGrade!,
    A: LetterGrade!,
    AMinus: LetterGrade!,
    BPlus: LetterGrade!,
    B: LetterGrade!,
    BMinus: LetterGrade!,
    CPlus: LetterGrade!,
    C: LetterGrade!,
    CMinus: LetterGrade!,
    D: LetterGrade!,
    F: LetterGrade!,
    P: LetterGrade!,
    NP: LetterGrade!
  }

  type LetterGrade {
    percent: Float!,
    numerator: Int!,
    percentile_high: Float!,
    percentile_low: Float!
  }

  type Query {
    grades(CourseControlNumber: Int!, Year: Int!, Semester: String!): Grade
  }
`;

export default typedef;
