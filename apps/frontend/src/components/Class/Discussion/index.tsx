import { useState } from "react";

import { Box, Button, Card, Container, Flex, Text } from "@repo/theme";

import useClass from "@/hooks/useClass";
import { useGetComments, useAddComment } from "@/hooks/api/discussion";
import useUser from "@/hooks/useUser";

import styles from "./Discussion.module.scss";

export default function Discussion() {
  const { class: _class } = useClass();
  const { user } = useUser();
  const courseId = _class.courseId;

  const { data: comments, loading } = useGetComments(courseId);
  const { addComment, loading: submitting } = useAddComment();

  const [commentText, setCommentText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const commentToSubmit = commentText.trim();
    setCommentText("");

    try {
      console.log("Submitting comment:", { courseId, comment: commentToSubmit });
      const result = await addComment(courseId, commentToSubmit);
      console.log("Full mutation result:", JSON.stringify(result, null, 2));
      
      if (result.error) {
        console.error("Error:", result.error);
        const errorMessage = result.error.message || "Unknown error occurred";
        alert(`Error: ${errorMessage}`);
        setCommentText(commentToSubmit);
        return;
      }
      
      const data = result.data as { addComment?: { _id: string; comment: string } } | undefined;
      console.log("Parsed data:", data);
      
      if (data?.addComment) {
        console.log("Comment posted successfully:", data.addComment);
      } else {
        console.warn("Mutation completed but no addComment in data:", result);
        setCommentText(commentToSubmit);
        alert("Comment may not have been saved. Please refresh and try again.");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      setCommentText(commentToSubmit);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    }
  };

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {user && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <Flex direction="column" gap="3">
                <label htmlFor="comment-textarea" className={styles.label}>
                  <Text weight="medium" size="2">Add a comment</Text>
                </label>
                <textarea
                  id="comment-textarea"
                  className={styles.textarea}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this course..."
                  rows={4}
                />
                <Flex justify="end">
                  <Button
                    type="submit"
                    disabled={!commentText.trim() || submitting}
                    variant="primary"
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </Flex>
              </Flex>
            </form>
          )}

          <Flex direction="column" gap="3">
            <Text weight="medium" size="3" className={styles.sectionTitle}>
              Comments ({comments.length})
            </Text>

            {loading ? (
              <Text className={styles.loading}>Loading comments...</Text>
            ) : comments.length === 0 ? (
              <Text className={styles.empty}>No comments yet. Be the first to share your thoughts!</Text>
            ) : (
              <Flex direction="column" gap="3">
                {(comments as Array<{ _id: string; userId: string; comment: string; createdAt: string }>).map((comment) => (
                  <Card.Root key={comment._id} className={styles.commentCard}>
                    <Card.Body>
                      <Flex direction="column" gap="2">
                        <Text className={styles.commentText}>{comment.comment}</Text>
                        <Flex gap="2" align="center">
                          {user?.email && comment.userId === user._id && (
                            <Text size="1" className={styles.meta}>
                              You
                            </Text>
                          )}
                          <Text size="1" className={styles.meta}>
                            {new Date(comment.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </Flex>
                      </Flex>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Flex>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

