import { ReactNode } from "react";

import { ColoredSquare } from "@repo/theme";

import styles from "./HoverInfoCard.module.scss";

interface HoverInfoCardProps {
  color: string;
  title: string;
  metadata: string;
  children: ReactNode;
}

export function HoverInfoCard({
  color,
  title,
  metadata,
  children,
}: HoverInfoCardProps) {
  return (
    <div className={styles.info}>
      <div className={styles.classInfo}>
        <div className={styles.heading}>
          <span className={styles.course}>
            <ColoredSquare color={color} size="md" />
            {title}
          </span>
        </div>
        <div className={styles.metadata}>{metadata}</div>
      </div>
      {children}
    </div>
  );
}
