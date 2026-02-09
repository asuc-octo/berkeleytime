import { gql } from "@apollo/client";

import { GetCommentsQuery } from "../generated/graphql";

export type IComment = NonNullable<GetCommentsQuery["comments"]>[number];

export const GET_COMMENTS = gql`
  query GetComments($courseId: String!) {
    comments(courseId: $courseId) {
      _id
      courseId
      createdBy
      text
      createdAt
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($courseId: String!, $text: String!) {
    createComment(courseId: $courseId, text: $text)
  }
`;
