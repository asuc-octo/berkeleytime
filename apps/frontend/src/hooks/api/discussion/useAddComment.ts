import { useMutation } from "@apollo/client/react";

import { ADD_COMMENT, GET_COMMENTS } from "@/lib/api/discussion";

export const useAddComment = () => {
  const [addCommentMutation, { loading, error }] = useMutation(ADD_COMMENT);

  const addComment = async (courseId: string, comment: string) => {
    console.log("useAddComment: Starting mutation", { courseId, comment });
    const result = await addCommentMutation({
      variables: {
        courseId,
        comment,
      },
      update(cache, { data }) {
        console.log("Cache update function called", { data });
        const mutationData = data as { addComment?: { _id: string; courseId: string; userId: string; comment: string; createdAt: string; updatedAt: string } } | undefined;
        if (!mutationData?.addComment) {
          console.warn("No addComment in data during cache update");
          return;
        }

        try {
          let existingComments: unknown[] = [];
          try {
            const existingData = cache.readQuery<{ comments: unknown[] }>({
              query: GET_COMMENTS,
              variables: { courseId },
            });
            existingComments = existingData?.comments || [];
            console.log("Existing cache data found:", existingComments.length, "comments");
          } catch (readError) {
            console.log("No existing cache data (first comment), starting fresh");
          }

          cache.writeQuery({
            query: GET_COMMENTS,
            variables: { courseId },
            data: {
              comments: [mutationData.addComment, ...existingComments],
            },
          });
          console.log("Cache updated successfully with", existingComments.length + 1, "comments");
        } catch (error) {
          console.error("Error updating cache:", error);
        }
      },
    });
    console.log("Mutation completed", { result });
    return result;
  };

  return {
    addComment,
    loading,
    error,
  };
};

