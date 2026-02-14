import { useMutation } from "@apollo/client/react";

import {
  PostCommentDocument,
  PostCommentMutation,
  PostCommentMutationVariables,
} from "@/lib/generated/graphql";

export function usePostComment() {
  return useMutation<PostCommentMutation, PostCommentMutationVariables>(
    PostCommentDocument
  );
}