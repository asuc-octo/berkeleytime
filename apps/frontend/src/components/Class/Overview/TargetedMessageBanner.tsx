import { useEffect, useMemo, useState } from "react";

import { ArrowUpRight } from "iconoir-react";

import { useIncrementTargetedMessageDismiss } from "@/hooks/api/targeted-message";
import { useTargetedMessagesForCourse } from "@/hooks/api/targeted-message";
import useClass from "@/hooks/useClass";
import {
  isTargetedMessageDismissed,
  isTargetedMessageSessionDismissed,
  markTargetedMessageAsDismissed,
  markTargetedMessageAsSessionDismissed,
  syncDismissedTargetedMessages,
} from "@/lib/targeted-message";

import styles from "./TargetedMessageBanner.module.scss";

interface TargetedMessageBannerProps {
  courseId: string;
}

export default function TargetedMessageBanner({
  courseId,
}: TargetedMessageBannerProps) {
  const [localDismissed, setLocalDismissed] = useState<Set<string>>(new Set());
  const { class: _class } = useClass();

  const { data: messages } = useTargetedMessagesForCourse(courseId);
  const { incrementDismiss } = useIncrementTargetedMessageDismiss();

  // Sync localStorage on mount to clean up stale IDs
  useEffect(() => {
    if (messages) {
      syncDismissedTargetedMessages(messages.map((m) => m.id));
    }
  }, [messages]);

  // Find the first visible, non-dismissed message
  const message = useMemo(() => {
    if (!messages) return null;

    return (
      messages.find((m) => {
        // Skip messages dismissed in this render cycle
        if (localDismissed.has(m.id)) return false;

        // Regular messages: check localStorage (permanent dismissal)
        if (!m.persistent && !m.reappearing) {
          return !isTargetedMessageDismissed(m.id);
        }

        // Reappearing messages: check sessionStorage (tab-scoped dismissal)
        if (m.reappearing) {
          return !isTargetedMessageSessionDismissed(m.id);
        }

        // Persistent messages: always show
        return true;
      }) ?? null
    );
  }, [messages, localDismissed]);

  if (!message) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLocalDismissed((prev) => new Set(prev).add(message.id));
    incrementDismiss(message.id);

    if (message.reappearing) {
      markTargetedMessageAsSessionDismissed(message.id);
    } else if (!message.persistent) {
      markTargetedMessageAsDismissed(message.id);
    }
  };

  return (
    <a
      href={`/message/click/${message.id}?courseId=${courseId}&semester=${_class.semester}&year=${_class.year}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.messageBox}
    >
      <div className={styles.messageHeader}>
        <p className={styles.messageTitle}>{message.title}</p>
        {!message.persistent && (
          <button
            className={styles.dismissButton}
            onClick={handleDismiss}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        )}
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
