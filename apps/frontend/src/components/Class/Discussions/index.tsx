import { useState } from "react";

import { useMutation } from "@apollo/client/react";
import { ChatBubble } from "iconoir-react";

import { Button, Container } from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import { useGetComments } from "@/hooks/api/comments/useGetComments";
import { IComment } from "@/lib/api/comments";
import { CreateCommentDocument } from "@/lib/generated/graphql";

import CommentCard from "./CommentCard";
import { ErrorDialog, SuccessDialog } from "./CommentDialogs";
import CommentForm from "./CommentForm";
import styles from "./Discussions.module.scss";

interface DiscussionsProps {
  courseId: string;
  courseName: string;
}

export default function Discussions({
  courseId,
  courseName,
}: DiscussionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { comments, loading, error, refetch } = useGetComments(courseId);
  const [createComment] = useMutation(CreateCommentDocument);

  const handleSubmit = async (text: string) => {
    try {
      await createComment({
        variables: { courseId, text },
        refetchQueries: ["GetComments"],
        awaitRefetchQueries: true,
      });
      setIsModalOpen(false);
      setIsSuccessDialogOpen(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create comment";
      setErrorMessage(message);
      setIsErrorDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.root}>
        <EmptyState heading="Loading Comments" loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.root}>
        <EmptyState
          icon={<ChatBubble width={32} height={32} strokeWidth={1.5} />}
          heading="Error Loading Comments"
          paragraph="We couldn't load the comments. Please try again."
        >
          <Button onClick={() => refetch()}>Retry</Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Container size="3">
        <div className={styles.header}>
          <h2>Course Discussions</h2>
          <Button onClick={() => setIsModalOpen(true)}>Add Comment</Button>
        </div>

        {comments.length === 0 ? (
          <EmptyState
            icon={<ChatBubble width={32} height={32} strokeWidth={1.5} />}
            heading="No Comments Yet"
            paragraph="Be the first to share your thoughts about this course!"
          >
            <Button onClick={() => setIsModalOpen(true)}>
              Add First Comment
            </Button>
          </EmptyState>
        ) : (
          <div className={styles.commentList}>
            {comments.map((comment: IComment) => (
              <CommentCard key={comment._id} comment={comment} />
            ))}
          </div>
        )}

        <CommentForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          courseName={courseName}
        />

        <SuccessDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => setIsSuccessDialogOpen(false)}
          title="Comment Added!"
          message="Your comment has been successfully added to the course."
        />

        <ErrorDialog
          isOpen={isErrorDialogOpen}
          onClose={() => setIsErrorDialogOpen(false)}
          title="Error"
          message={errorMessage || "Failed to add comment. Please try again."}
        />
      </Container>
    </div>
  );
}
