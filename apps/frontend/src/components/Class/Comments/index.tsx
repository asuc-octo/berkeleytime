import { FormEvent, useCallback, useMemo, useState } from "react";

import { useMutation } from "@apollo/client/react";

import { Box, Button, Container, Flex } from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import { useCourseComments } from "@/hooks/api/discussion";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";
import { AddCourseCommentDocument } from "@/lib/generated/graphql";

import styles from "./Comments.module.scss";

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
};

export default function Comments() {
  const { class: classInfo } = useClass();
  const { user } = useUser();
  const [commentBody, setCommentBody] = useState("");

  const courseId = classInfo.courseId;
  const { comments, loading, refetch, error: commentsError } =
    useCourseComments({ courseId });
  const [addCourseComment, { loading: isSubmitting }] = useMutation(
    AddCourseCommentDocument
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const orderedComments = useMemo(() => {
    const safeComments = comments.filter(
      (comment): comment is NonNullable<typeof comment> => Boolean(comment)
    );
    return [...safeComments].sort((a, b) => {
      return (
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
      );
    });
  }, [comments]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const body = commentBody.trim();
      if (!body || !courseId) return;

      try {
        setErrorMessage("");
        await addCourseComment({
          variables: {
            courseId,
            body,
          },
        });
        setCommentBody("");
        await refetch();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to submit comment.";
        setErrorMessage(message);
      }
    },
    [addCourseComment, commentBody, courseId, refetch]
  );

  const handleSignIn = useCallback(() => {
    signIn(window.location.href);
  }, []);

  const isSubmitDisabled = !commentBody.trim() || !courseId || isSubmitting;

  return (
    <Box p="5" className={styles.root}>
      <Container size="3">
        <Flex direction="column" gap="4">
          <form className={styles.form} onSubmit={handleSubmit}>
            <textarea
              className={styles.textarea}
              placeholder={
                user
                  ? "Share a comment about this course"
                  : "Sign in to add a comment"
              }
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              disabled={!user}
            />
            <Flex justify="between" align="center" gap="3">
              <p className={styles.helperText}>
                {user
                  ? "Keep it helpful and on topic."
                  : "Sign in to participate in the discussion."}
              </p>
              {user ? (
                <Button type="submit" disabled={isSubmitDisabled}>
                  Post comment
                </Button>
              ) : (
                <Button variant="secondary" type="button" onClick={handleSignIn}>
                  Sign in to comment
                </Button>
              )}
            </Flex>
            {errorMessage && (
              <p className={styles.errorText}>{errorMessage}</p>
            )}
          </form>

          <div className={styles.list}>
            {commentsError ? (
              <EmptyState
                heading="Unable to load comments"
                paragraph="Please try again in a moment."
              />
            ) : loading ? (
              <EmptyState heading="Loading comments" loading />
            ) : orderedComments.length === 0 ? (
              <EmptyState
                heading="No comments yet"
                paragraph="Be the first to share a note about this course."
              />
            ) : (
              orderedComments.map((comment) => (
                <div className={styles.commentCard} key={comment.id}>
                  <p className={styles.commentBody}>{comment.body}</p>
                  <p className={styles.timestamp}>
                    {formatTimestamp(comment.createdAt ?? "")}
                  </p>
                </div>
              ))
            )}
          </div>
        </Flex>
      </Container>
    </Box>
  );
}
