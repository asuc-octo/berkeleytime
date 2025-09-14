import { useCallback } from "react";

import { useMutation } from "@apollo/client";

import {
  CREATE_DISCUSSION_COMMENT,
  GET_DISCUSSION_COMMENTS,
  CreateDiscussionCommentResponse,
  CreateDiscussionCommentInput,
} from "@/lib/api/discussions";

export const useCreateDiscussionComment = (onCommentCreated?: () => void) => {
  const [createComment, { loading, error }] = useMutation<CreateDiscussionCommentResponse>(
    CREATE_DISCUSSION_COMMENT,
    {
      update(cache, { data }) {
        if (!data?.createDiscussionComment) return;

        // Read the existing comments from cache for this subject
        const newComment = data.createDiscussionComment;
        const subject = newComment.subject;

        try {
          const existingData = cache.readQuery<any>({
            query: GET_DISCUSSION_COMMENTS,
            variables: { filter: { subject }, limit: null, offset: null }
          });

          if (existingData) {
            // Add the new comment to the beginning of the list
            cache.writeQuery({
              query: GET_DISCUSSION_COMMENTS,
              variables: { filter: { subject }, limit: null, offset: null },
              data: {
                discussionComments: [newComment, ...existingData.discussionComments]
              }
            });
          }
        } catch (e) {
          // If cache read fails, that's okay - the refetch will handle it
          console.log("Cache update failed, will rely on refetch:", e);
        }
      }
    }
  );

  const createDiscussionComment = useCallback(
    async (input: CreateDiscussionCommentInput) => {
      try {
        const result = await createComment({
          variables: { input },
        });
        
        // Call the callback to trigger refetch
        if (onCommentCreated) {
          onCommentCreated();
        }
        
        return result.data?.createDiscussionComment;
      } catch (err) {
        console.error("Error creating discussion comment:", err);
        throw err;
      }
    },
    [createComment, onCommentCreated]
  );

  return {
    createDiscussionComment,
    loading,
    error,
  };
};
