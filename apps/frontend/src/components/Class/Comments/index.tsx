import { useEffect, useState } from "react";
import { Box, Button, Container, Flex } from "@repo/theme";
import useClass from "@/hooks/useClass";
import styles from "./comments.module.scss";

interface Comment {
  id: number;
  text: string;
  user_email?: string;
  created_at?: string;
}

export default function Comments() {
  const { class: classData } = useClass();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Construct course identifier
  const courseIdentifier = `${classData.subject} ${classData.courseNumber}`;

  // Fetch comments when component mounts or course changes
  useEffect(() => {
    fetchComments();
  }, [courseIdentifier]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call your backend GET endpoint
      const response = await fetch(
        `/api/comments?subject=${encodeURIComponent(classData.subject)}&course_number=${encodeURIComponent(classData.courseNumber)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments. Please try again.");
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Call your backend POST endpoint
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: classData.subject,
          course_number: classData.courseNumber,
          text: newComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to post comment: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Clear input and refresh comments
      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmitComment();
    }
  };

  return (
    <Box className={styles.commentsWrapper}>
      <Container size="3">
        <Flex direction="column" gap="4" className={styles.commentsContainer}>
          {/* Error Message */}
          {error && (
            <Box className={styles.errorMessage}>
              {error}
            </Box>
          )}

          {/* Comment Input Section */}
          <Box className={styles.commentInput}>
            <Flex direction="column" gap="3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Write a comment about this course... (Ctrl+Enter to submit)"
                className={styles.textarea}
                rows={4}
                disabled={isLoading}
              />
              <Flex justify="end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isLoading || !newComment.trim()}
                  className={styles.submitButton}
                >
                  {isLoading ? "Posting..." : "Post Comment"}
                </Button>
              </Flex>
            </Flex>
          </Box>

          {/* Comments List Section */}
          <Box className={styles.commentsList}>
            <h3 className={styles.commentsHeader}>
              Comments ({comments.length})
            </h3>
            {isLoading && comments.length === 0 ? (
              <Box className={styles.loadingText}>Loading comments...</Box>
            ) : comments.length === 0 ? (
              <Box className={styles.emptyText}>
                No comments yet. Be the first to share your thoughts!
              </Box>
            ) : (
              <Flex direction="column" gap="3">
                {comments.map((comment) => (
                  <Box key={comment.id} className={styles.commentCard}>
                    <p className={styles.commentText}>{comment.text}</p>
                    <Flex gap="2" className={styles.commentMeta}>
                      {comment.user_email && (
                        <span className={styles.metaItem}>
                          {comment.user_email}
                        </span>
                      )}
                      {comment.created_at && (
                        <>
                          {comment.user_email && (
                            <span className={styles.metaDivider}>•</span>
                          )}
                          <span className={styles.metaItem}>
                            {new Date(comment.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </>
                      )}
                    </Flex>
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}