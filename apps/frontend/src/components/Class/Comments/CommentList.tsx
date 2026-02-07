import React from "react";

import CommentItem from "./CommentItem";
import styles from "./comments.module.scss";

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <p className={styles.emptyText}>No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className={styles.commentsList}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;