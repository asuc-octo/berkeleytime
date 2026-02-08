import { useState } from "react";

import { Box, Button, Container, Flex } from "@repo/theme";

import { useAddCourseComment, useCourseComments } from "@/hooks/api/discussion";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";

import styles from "./Discussion.module.scss";

export default function Discussion() {
  const { user } = useUser();
  const { class: _class } = useClass();
  const { subject, courseNumber } = _class;

  const { data, loading } = useCourseComments(subject, courseNumber);
  const [addComment, { loading: submitting, error: mutationError }] =
    useAddCourseComment(subject, courseNumber);

  const [content, setContent] = useState("");

  const comments = data?.courseComments ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    try {
      await addComment({
        variables: { subject, courseNumber, content: trimmed },
      });
      setContent("");
    } catch {
      // Error surfaced via mutationError
    }
  };

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {!user ? (
            <div className={styles.loginPrompt}>
              <p className={styles.loginMessage}>
                You need to be logged in to post a comment.
              </p>
              <Button
                type="button"
                onClick={() => signIn(window.location.href)}
              >
                Sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <textarea
                className={styles.textarea}
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                disabled={submitting}
              />
              <Button type="submit" disabled={!content.trim() || submitting}>
                Post Comment
              </Button>
              {mutationError && (
                <p className={styles.error}>
                  {mutationError.message.includes("logged in")
                    ? "You must be logged in to post a comment."
                    : mutationError.message}
                </p>
              )}
            </form>
          )}

          <div className={styles.commentsList}>
            {loading ? (
              <p className={styles.muted}>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className={styles.muted}>
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <p className={styles.commentContent}>{comment.content}</p>
                  {(comment.createdBy || comment.createdAt) && (
                    <p className={styles.commentMeta}>
                      {comment.createdBy && (
                        <span className={styles.metaItem}>
                          {comment.createdBy}
                        </span>
                      )}
                      {comment.createdAt && (
                        <span className={styles.metaItem}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Flex>
      </Container>
    </Box>
  );
}
