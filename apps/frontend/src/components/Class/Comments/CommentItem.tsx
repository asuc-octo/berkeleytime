import styles from "./comments.module.scss";

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className={styles.commentCard}>
      <p className={styles.commentText}>{comment.content}</p>
      <small className={styles.commentMeta}>
        {comment.userId} •{" "}
        {new Date(comment.createdAt).toLocaleString()}
      </small>
    </div>
  );
}
