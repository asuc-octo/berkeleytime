import { IComment } from "@/lib/api/comments";

import styles from "./CommentCard.module.scss";

interface CommentCardProps {
  comment: IComment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  const formattedDate = new Date(comment.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.author}>Anonymous User</span>
        <span className={styles.timestamp}>{formattedDate}</span>
      </div>
      <p className={styles.text}>{comment.text}</p>
    </div>
  );
}
