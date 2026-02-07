import { useMemo, useState } from "react";

import { Box, Button, Flex, Text } from "@repo/theme";

import { useCourseComments } from "@/hooks/api/discussion";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";

import styles from "./Discussion.module.scss";

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString();
};

export default function Discussion() {
  const { class: classInfo } = useClass();
  const { user } = useUser();
  const [commentBody, setCommentBody] = useState("");

  const subject = classInfo?.subject ?? "";
  const courseNumber = classInfo?.courseNumber ?? "";

  const { comments, loading, submitComment, submitting } = useCourseComments(
    subject,
    courseNumber
  );

  const canSubmit = Boolean(user && commentBody.trim().length > 0);
  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [comments]
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await submitComment(commentBody.trim());
    setCommentBody("");
  };

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="3">
        <Box>
          <Text as="div" size="2" className={styles.label}>
            Add a comment
          </Text>
          <textarea
            className={styles.textarea}
            placeholder={
              user
                ? "Share your thoughts about this course..."
                : "Sign in to comment"
            }
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            disabled={!user}
          />
          <Flex justify="end" mt="2">
            <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
              Post Comment
            </Button>
          </Flex>
        </Box>
        <Box>
          <Text as="div" size="2" className={styles.label}>
            Recent comments
          </Text>
          {loading ? (
            <Text as="div" size="2">
              Loading comments...
            </Text>
          ) : sortedComments.length === 0 ? (
            <Text as="div" size="2">
              No comments yet.
            </Text>
          ) : (
            <Flex direction="column" gap="2">
              {sortedComments.map((comment) => (
                <Box key={comment.id} className={styles.commentCard}>
                  <Flex justify="between" align="center" mb="1">
                    <Text as="div" size="2" className={styles.commentMeta}>
                      {comment.createdBy}
                    </Text>
                    <Text as="div" size="1" className={styles.commentMeta}>
                      {formatTimestamp(comment.createdAt)}
                    </Text>
                  </Flex>
                  <Text as="div" size="2" className={styles.commentBody}>
                    {comment.comment}
                  </Text>
                </Box>
              ))}
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
