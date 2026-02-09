import { Card } from "@repo/theme";

import styles from "./CommentCard.module.scss";

export interface CommentCardProps {
  content: string;
  timestamp: Date | string;
}

function formatTimestamp(date: Date | string): string {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function CommentCard({ content, timestamp }: CommentCardProps) {
  return (
    <Card.RootColumn hoverColorChange={false} className={styles.root}>
      <Card.ColumnBody>
        <p className={styles.content}>{content}</p>
        <time className={styles.timestamp} dateTime={new Date(timestamp).toISOString()}>
          {formatTimestamp(timestamp)}
        </time>
      </Card.ColumnBody>
    </Card.RootColumn>
  );
}
