import { useCallback } from "react";

import { MutationHookOptions, useMutation } from "@apollo/client";

import { ADD_COMMENT, CreateCommentResponse } from "@/lib/api";

export const useAddComment = () => {
  const mutation = useMutation<CreateCommentResponse>(ADD_COMMENT, {
    update(cache, { data }) {
      const newComment = data?.addComment;

      if (!newComment) return;

      cache.modify({
        fields: {
          comments(existingComments = []) {
            return [...existingComments, newComment];
          },
        },
      });
    },
  });

  const addComment = useCallback(
    async (
      subject: string,
      number: string,
      userEmail: string,
      content: string,
      options?: Omit<MutationHookOptions<CreateCommentResponse>, "variables">
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { subject, number, userEmail, content },
      });
    },
    [mutation]
  );

  return [addComment, mutation[1]] as [
    mutate: typeof addComment,
    result: (typeof mutation)[1],
  ];
};
