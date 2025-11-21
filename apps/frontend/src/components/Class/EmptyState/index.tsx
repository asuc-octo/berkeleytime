import { ReactNode } from "react";

import { LoadingIndicator } from "@repo/theme";

import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  icon?: ReactNode;
  heading: string;
  paragraph?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
}

const DEFAULT_LOADING_PARAGRAPH = "Hang tight while we fetch all the details.";

export default function EmptyState({
  icon,
  heading,
  paragraph,
  children,
  loading = false,
}: EmptyStateProps) {
  const displayParagraph =
    paragraph ?? (loading ? DEFAULT_LOADING_PARAGRAPH : null);

  return (
    <div className={styles.placeholder}>
      {loading ? (
        <LoadingIndicator size="lg" />
      ) : (
        icon && <div>{icon}</div>
      )}
      <p className={styles.heading}>{heading}</p>
      {displayParagraph && (
        <p className={styles.paragraph}>{displayParagraph}</p>
      )}
      {children}
    </div>
  );
}

