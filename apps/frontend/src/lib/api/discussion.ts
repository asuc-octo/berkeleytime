import { gql } from "@apollo/client";

export interface IComment {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string | null;
  parentId?: string | null;
  year: number;
  semester: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
}

export const COMMENTS_FOR_CLASS = gql`
  query CommentsForClass(
    $year: Int!
    $semester: Semester!
    $subject: String!
    $courseNumber: String!
    $classNumber: String!
  ) {
    commentsForClass(
      year: $year
      semester: $semester
      subject: $subject
      courseNumber: $courseNumber
      classNumber: $classNumber
    ) {
      comments {
        id
        body
        authorId
        authorName
        createdAt
        updatedAt
        parentId
        year
        semester
        subject
        courseNumber
        classNumber
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      body
      authorId
      authorName
      createdAt
      updatedAt
      parentId
      year
      semester
      subject
      courseNumber
      classNumber
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;
