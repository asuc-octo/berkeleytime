import { gql } from "@apollo/client";

import { IClass } from "./classes";

export type PostIdentifier = string & {
  readonly __brand: unique symbol;
};

export interface IPost {
  __typename: "Post";
  _id: PostIdentifier;
  text: string;
  image: string;
  class: IClass;
}

export interface ReadPostResponse {
  post: IPost;
}

export const READ_POST = gql`
  query GetPost {
    post {
      _id
      text
      image
      class {
        _id
        name
      }
    }
  }
`;

export interface ReadPostsResponse {
  posts: IPost[];
}

export const READ_POSTS = gql`
  query GetPosts {
    posts {
      _id
      text
      image
      class {
        _id
        name
      }
    }
  }
`;
