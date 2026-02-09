import { useState } from "react";

import { ArrowUpRight } from "iconoir-react";

import { useIncrementTargetedMessageDismiss } from "@/hooks/api/targeted-message";
import { useTargetedMessagesForCourse } from "@/hooks/api/targeted-message";

import styles from "./Overview.module.scss";

interface TargetedMessageBannerProps {
  courseId: string;
}

export default function TargetedMessageBanner({
  courseId,
}: TargetedMessageBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const { data: messages } = useTargetedMessagesForCourse(courseId);
  const { incrementDismiss } = useIncrementTargetedMessageDismiss();

  const message = messages?.[0] ?? null;

  if (dismissed || !message) return null;

  return (
    <a
      href={`/message/click/${message.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.messageBox}
    >
      <div className={styles.messageHeader}>
        <p className={styles.messageTitle}>{message.title}</p>
        <button
          className={styles.dismissButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDismissed(true);
            incrementDismiss(message.id);
          }}
          aria-label="Dismiss message"
        >
          ✕
        </button>
      </div>
      {message.description && (
        <p className={styles.messageDescription}>{message.description}</p>
      )}
      <div className={styles.applyButton}>
        {message.linkText || "Learn more"}{" "}
        <ArrowUpRight width={14} height={14} />
      </div>
    </a>
  );
}
