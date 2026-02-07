import { useState } from "react";

import { ChatBubbleEmpty } from "iconoir-react";

import { Box, Button, Container, Input } from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import { useAddCourseDiscussion, useCourseDiscussions } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";

import styles from "./Discussion.module.scss";

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return isoString;
  }
}

export default function Discussion() {
  const { class: _class } = useClass();
  const { user } = useUser();
  const courseId = _class?.courseId ?? "";

  const { discussions, loading, error } = useCourseDiscussions(courseId);
  const [addComment, { loading: submitting, error: submitError }] =
    useAddCourseDiscussion(courseId);

  const [commentText, setCommentText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || submitting) return;
    try {
      await addComment(trimmed);
      setCommentText("");
    } catch {
      // Error surfaced via submitError
    }
  };

  if (!courseId) {
    return null;
  }

  if (loading) {
    return (
      <Box p="5">
        <Container size="3">
          <EmptyState heading="Loading comments" loading />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="5">
        <Container size="3">
          <EmptyState
            heading="Couldn’t load comments"
            paragraph={
              user
                ? "Something went wrong. Try again later."
                : "Sign in to view and add comments."
            }
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box p="5">
      <Container size="3">
        <div className={styles.root}>
          {user && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputRow}>
                <Input
                  type="text"
                  className={styles.input}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  disabled={submitting}
                  aria-label="Comment"
                />
                <Button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!commentText.trim() || submitting}
                >
                  {submitting ? "Posting…" : "Post comment"}
                </Button>
              </div>
              {submitError && (
                <p className={styles.error}>
                  {submitError.message ?? "Failed to post comment."}
                </p>
              )}
            </form>
          )}

          {discussions.length === 0 ? (
            <EmptyState
              icon={<ChatBubbleEmpty width={32} height={32} />}
              heading="No comments yet"
              paragraph={
                user
                  ? "Be the first to share something about this course."
                  : "Sign in to view and add comments."
              }
            />
          ) : (
            <div className={styles.list}>
              {discussions.map((d) => (
                <article key={d._id} className={styles.commentCard}>
                  <div className={styles.commentMeta}>
                    {d.user
                      ? [d.user.name, d.user.email]
                          .filter(Boolean)
                          .join(" · ") || "Unknown user"
                      : "Unknown user"}
                    {" · "}
                    {formatTimestamp(d.timestamp)}
                  </div>
                  <div className={styles.commentBody}>{d.comment}</div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Box>
  );
}
