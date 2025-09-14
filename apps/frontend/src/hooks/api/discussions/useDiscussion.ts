import { useQuery, useMutation } from "@apollo/client";
import {
  ADD_COMMENT,
  IComment,
  READ_DISCUSSION,
  ReadDiscussionResponse,
} from "@/lib/api";

export function useDiscussion(courseId: string) {
  // 1. Fetch the list of comments
  const { data, loading, error } = useQuery<ReadDiscussionResponse>(
    READ_DISCUSSION,
    {
      variables: { courseId },
      skip: !courseId, // Don't run query if courseId is not ready
    }
  );

  // 2. Prepare the mutation for adding a comment
  const [addCommentMutation] = useMutation(ADD_COMMENT, {
    // 3. This function updates the cache after a successful mutation
    update(cache, { data: { addComment } }) {
      // Read the existing comments from the cache
      const existingData = cache.readQuery<ReadDiscussionResponse>({
        query: READ_DISCUSSION,
        variables: { courseId },
      });

      if (existingData?.commentsByCourse && addComment) {
        // Write the new comment to the front of the list
        cache.writeQuery({
          query: READ_DISCUSSION,
          variables: { courseId },
          data: {
            commentsByCourse: [addComment, ...existingData.commentsByCourse],
          },
        });
      }
    },
  });

  // 4. Create a simple function to call the mutation
  const postComment = async ({ text, userId }: { text: string; userId: string }) => {
    return addCommentMutation({
      variables: {
        courseId,
        userId,
        text,
      },
    });
  };

  return {
    comments: data?.commentsByCourse || [],
    loading,
    error,
    postComment,
  };
}