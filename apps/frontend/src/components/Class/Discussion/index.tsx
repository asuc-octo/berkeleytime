import { useState } from "react";
import { Box, Flex } from "@repo/theme"; // Using reusable components
import styles from "./Discussion.module.scss";

import useClass from "@/hooks/useClass";
import { useDiscussion } from "@/hooks/api";
// You'll need a way to get the current user, e.g.:
// import { useReadUser } from "@/hooks/api";

export default function Discussion() {
  const { class: _class } = useClass();
  // const { data: user } = useReadUser(); // Example for getting user data

  const [newComment, setNewComment] = useState("");

  // Create a unique ID for the course discussion from class data
  const courseId = `${_class?.subject}-${_class?.courseNumber}`;

  const { comments, loading, error, postComment } = useDiscussion(courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) { // && user
      try {
        await postComment({
          text: newComment,
          userId: "test-user-123", // Replace with actual user ID, e.g., user.id
        });
        setNewComment(""); // Clear textbox on success
      } catch (err) {
        console.error("Failed to post comment:", err);
        // Optionally, show an error message to the user
      }
    }
  };

  if (loading) return <p>Loading discussion...</p>;
  if (error) return <p>Error loading comments: {error.message}</p>;

  return (
    <Box className={styles.root}>
      <Flex direction="column" gap="5" className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            className={styles.textArea}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this class..."
          />
          <button type="submit" className={styles.submitButton}>
            Post Comment
          </button>
        </form>

        <div className={styles.commentsList}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <p>{comment.text}</p>
                <small>
                  Posted on {new Date(Number(comment.createdAt)).toLocaleDateString()}
                </small>
              </div>
            ))
          ) : (
            <p className={styles.noComments}>No comments yet. Be the first!</p>
          )}
        </div>
      </Flex>
    </Box>
  );
}