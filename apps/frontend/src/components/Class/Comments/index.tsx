import { useCallback, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";

import { Box, Button, Container, Flex } from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";
import { IComment } from "@/lib/api/discussion";
import {
  CommentsForClassDocument,
  CreateCommentDocument,
  DeleteCommentDocument,
} from "@/lib/generated/graphql";

import styles from "./Comments.module.scss";

function formatCommentDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

interface CommentItemProps {
  comment: IComment;
  currentUserId: string | null;
  onDelete: (id: string) => void;
  deleteLoading: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  deleteLoading,
}: CommentItemProps) {
  const canDelete = currentUserId != null && comment.authorId === currentUserId;

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <span className={styles.authorName}>{comment.authorName}</span>
        <span className={styles.commentMeta}>
          {formatCommentDate(comment.createdAt)}
        </span>
      </div>
      <p className={styles.commentBody}>{comment.body}</p>
      {canDelete && (
        <div className={styles.commentActions}>
          <Button
            variant="tertiary"
            isDelete
            onClick={() => onDelete(comment.id)}
            disabled={deleteLoading}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Comments() {
  const { class: _class } = useClass();
  const { user } = useUser();
  const [newBody, setNewBody] = useState("");

  const year = _class.year;
  const semester = _class.semester;
  const subject = _class.subject;
  const courseNumber = _class.courseNumber;
  const classNumber = _class.number;

  const { data, loading, error } = useQuery(CommentsForClassDocument, {
    variables: {
      year,
      semester,
      subject,
      courseNumber,
      classNumber,
    },
  });

  const [createComment, { loading: createLoading }] = useMutation(
    CreateCommentDocument,
    {
      refetchQueries: [
        {
          query: CommentsForClassDocument,
          variables: {
            year,
            semester,
            subject,
            courseNumber,
            classNumber,
          },
        },
      ],
    }
  );

  const [deleteComment, { loading: deleteLoading }] = useMutation(
    DeleteCommentDocument,
    {
      refetchQueries: [
        {
          query: CommentsForClassDocument,
          variables: {
            year,
            semester,
            subject,
            courseNumber,
            classNumber,
          },
        },
      ],
    }
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const body = newBody.trim();
      if (!body || createLoading) return;
      createComment({
        variables: {
          input: {
            body,
            year,
            semester,
            subject,
            courseNumber,
            classNumber,
          },
        },
      }).then(() => setNewBody(""));
    },
    [
      newBody,
      createLoading,
      createComment,
      year,
      semester,
      subject,
      courseNumber,
      classNumber,
    ]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteComment({ variables: { id } });
    },
    [deleteComment]
  );

  const comments = data?.commentsForClass?.comments ?? [];

  if (error) {
    return (
      <Box p="5">
        <Container size="3">
          <EmptyState
            heading="Couldn't load comments"
            paragraph={error.message}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="4" className={styles.root}>
          <h2 className={styles.label}>Discussion</h2>

          {user ? (
            <form onSubmit={handleSubmit} className={styles.commentForm}>
              <textarea
                className={styles.textarea}
                placeholder="Add a comment..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                disabled={createLoading}
                rows={3}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!newBody.trim() || createLoading}
              >
                {createLoading ? "Posting…" : "Post comment"}
              </Button>
            </form>
          ) : (
            <Button
              variant="secondary"
              onClick={() => signIn(window.location.href)}
            >
              Sign in to comment
            </Button>
          )}

          {loading ? (
            <EmptyState heading="Loading comments…" loading />
          ) : comments.length === 0 ? (
            <EmptyState
              heading="No comments yet"
              paragraph="Be the first to start the discussion."
            />
          ) : (
            <div className={styles.commentList}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?._id ?? null}
                  onDelete={handleDelete}
                  deleteLoading={deleteLoading}
                />
              ))}
            </div>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
