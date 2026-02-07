import { FormEvent, useCallback, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";

import { Box, Button, Card, Container, Input } from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import useClass from "@/hooks/useClass";
import {
  ADD_COURSE_COMMENT,
  GET_COURSE_COMMENTS,
  ICourseComment,
} from "@/lib/api/comments";

import styles from "./Comments.module.scss";

export default function Comments() {
  const {
    class: { subject, courseNumber },
  } = useClass();

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments
  const { data, loading, refetch } = useQuery<{
    courseComments: ICourseComment[];
  }>(GET_COURSE_COMMENTS, {
    variables: {
      subject,
      courseNumber,
    },
    pollInterval: 10000, // Poll every 10 seconds for new comments
  });

  const [addComment] = useMutation<
    { addCourseComment: ICourseComment },
    { input: { subject: string; courseNumber: string; text: string } }
  >(ADD_COURSE_COMMENT);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!commentText.trim()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await addComment({
          variables: {
            input: {
              subject,
              courseNumber,
              text: commentText.trim(),
            },
          },
        });

        // Clear the input
        setCommentText("");

        // Refetch comments to show the new one
        await refetch();
      } catch (error) {
        console.error("Failed to add comment:", error);
        // TODO: Show error message to user
      } finally {
        setIsSubmitting(false);
      }
    },
    [commentText, subject, courseNumber, addComment, refetch]
  );

  const comments = data?.courseComments ?? [];

  if (loading && comments.length === 0) {
    return (
      <Box p="5" className={styles.root}>
        <Container size="3">
          <div className={styles.loadingText}>Loading comments...</div>
        </Container>
      </Box>
    );
  }

  return (
    <Box p="5" className={styles.root}>
      <Container size="3">
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <h2 className={styles.title}>Course Comments</h2>
            <p className={styles.subtitle}>
              Share your thoughts about {subject} {courseNumber}
            </p>
          </div>

          {/* Comment form */}
          <Card.Root className={styles.commentForm}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                disabled={isSubmitting}
                className={styles.input}
              />
              <Button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </Card.Root>

          {/* Comments list */}
          {comments.length === 0 ? (
            <EmptyState
              icon="💬"
              title="No comments yet"
              description="Be the first to share your thoughts about this course!"
            />
          ) : (
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <Card.Root key={comment.id} className={styles.commentCard}>
                  <div className={styles.commentMeta}>
                    <div className={styles.commentUser}>{comment.userId}</div>
                    <div className={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <p className={styles.commentText}>{comment.text}</p>
                </Card.Root>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Box>
  );
}
