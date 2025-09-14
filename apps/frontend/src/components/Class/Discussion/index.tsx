import { useState, useMemo, useEffect } from "react";

import { Box, Container, Flex, Button, Input } from "@repo/theme";

import { useDiscussionComments } from "@/hooks/api/discussions/useDiscussionComments";
import { useCreateDiscussionComment } from "@/hooks/api/discussions/useCreateDiscussionComment";
import { useReadUser } from "@/hooks/api";
import { IDiscussionComment } from "@/lib/api/discussions";
import useClass from "@/hooks/useClass";

import styles from "./Discussion.module.scss";

export default function Discussion() {
  const { class: _class } = useClass();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  const { data: user, loading: userLoading } = useReadUser();

  // Create subject identifier for this class
  // Format: SUBJECT-COURSENUMBER-NUMBER-YEAR-SEMESTER (e.g., "AEROENG-C162-001-2025-Fall")
  const subject = `${_class.subject}-${_class.courseNumber}-${_class.number}-${_class.year}-${_class.semester}`;
  
  // Generate subject identifier for this class
  // Format: SUBJECT-COURSENUMBER-NUMBER-YEAR-SEMESTER

  const { comments: savedComments, loading, error, refetch } = useDiscussionComments(
    { subject },
    undefined, // limit
    undefined  // offset
  );

  // Log any GraphQL errors
  useEffect(() => {
    if (error) {
      console.error("GraphQL Error loading comments:", error);
    }
  }, [error]);

  const { createDiscussionComment } = useCreateDiscussionComment(() => {
    console.log("Comment created, refetching comments...");
    refetch();
  });

  // Use only saved comments from the database
  const allComments = useMemo(() => {
    // Sort by creation date (newest first) - though backend already sorts
    return savedComments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [savedComments]);

  // Debug: Log when comments are loaded
  useEffect(() => {
    if (!loading && !error) {
      console.log(`Discussion loaded: ${savedComments.length} comments for ${subject}`);
    }
  }, [loading, error, savedComments.length, subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Posting comment:", { subject, content: commentText.trim() });
      
      // Submit to backend and save to database
      const result = await createDiscussionComment({
        subject,
        content: commentText.trim(),
      });
      
      console.log("Comment posted successfully:", result?.id);
      
      // Clear the form - cache will be automatically updated
      setCommentText("");
    } catch (err: any) {
      console.error("Failed to create comment:", err);
      
      // Show user-friendly error message
      if (err.message?.includes("Authentication required") || err.message?.includes("Not authenticated")) {
        alert("Please sign in to post comments.");
      } else {
        alert(`Failed to post comment: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || userLoading) {
    return (
      <Box p="5">
        <Container size="3">
          <div className={styles.loading}>Loading...</div>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="5">
        <Container size="3">
          <div className={styles.error}>
            Error loading comments: {error.message}
          </div>
        </Container>
      </Box>
    );
  }

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmit} className={styles.commentForm}>
              <Flex direction="column" gap="3">
                <label htmlFor="comment-input" className={styles.label}>
                  Add a comment
                </label>
                <Input
                  id="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this class..."
                  disabled={isSubmitting}
                  className={styles.commentInput}
                />
                <Flex justify="end">
                  <Button
                    type="submit"
                    disabled={!commentText.trim() || isSubmitting}
                    className={styles.submitButton}
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </Flex>
              </Flex>
            </form>
          ) : (
            <div className={styles.commentForm}>
              <Flex direction="column" gap="3">
                <label className={styles.label}>
                  Add a comment
                </label>
                <Input
                  placeholder="Please sign in to post comments..."
                  disabled={true}
                  className={styles.commentInput}
                />
                <Flex justify="end">
                  <Button
                    disabled={true}
                    className={styles.submitButton}
                  >
                    Sign in to comment
                  </Button>
                </Flex>
              </Flex>
            </div>
          )}

          {/* Comments List */}
          <div className={styles.commentsSection}>
            <h3 className={styles.commentsTitle}>
              Comments ({allComments.length})
            </h3>
            {allComments.length === 0 ? (
              <div className={styles.noComments}>
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              <Flex direction="column" gap="3">
                {allComments.map((comment: IDiscussionComment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.commentContent}>
                      {comment.content}
                    </div>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentUser}>
                        User {comment.userId.slice(-4)}
                      </span>
                      <span className={styles.commentDate}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </Flex>
            )}
          </div>
        </Flex>
      </Container>
    </Box>
  );
}
