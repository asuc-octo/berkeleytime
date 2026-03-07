import { useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { ArrowUpRight } from "iconoir-react";

import { useIncrementTargetedMessageDismiss } from "@/hooks/api/targeted-message";
import {
  GetCourseTitleDocument,
  GetTargetedMessagesForCourseDocument,
  GetTargetedMessagesForCourseQuery,
} from "@/lib/generated/graphql";
import {
  isTargetedMessageDismissed,
  isTargetedMessageSessionDismissed,
  markTargetedMessageAsDismissed,
  markTargetedMessageAsSessionDismissed,
  syncDismissedTargetedMessages,
} from "@/lib/targeted-message";

import styles from "./TargetedMessageBanner.module.scss";

interface TargetedMessage {
  id: string;
  title: string;
  description?: string | null;
  link?: string | null;
  linkText?: string | null;
  persistent: boolean;
  reappearing: boolean;
}

interface ResolvedMessage {
  message: TargetedMessage;
  courseId: string;
  courseNumber: string;
}

interface CourseIdentifier {
  subject: string;
  courseNumber: string;
}

interface TargetedMessageBannerProps {
  courses: CourseIdentifier[];
}

export default function TargetedMessageBanner({
  courses,
}: TargetedMessageBannerProps) {
  const client = useApolloClient();
  const [localDismissed, setLocalDismissed] = useState<Set<string>>(new Set());
  const [resolved, setResolved] = useState<ResolvedMessage | null>(null);
  const { incrementDismiss } = useIncrementTargetedMessageDismiss();

  const coursesKey = useMemo(
    () =>
      [...courses]
        .map((c) => `${c.subject}-${c.courseNumber}`)
        .sort()
        .join(","),
    [courses]
  );

  useEffect(() => {
    if (courses.length === 0) {
      setResolved(null);
      return;
    }

    let cancelled = false;

    const findMessage = async () => {
      // Deduplicate by subject+courseNumber
      const seen = new Set<string>();
      const unique = courses.filter((c) => {
        const key = `${c.subject}-${c.courseNumber}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      for (const course of unique) {
        if (cancelled) return;

        try {
          // Resolve courseId from subject+courseNumber
          const courseResult = await client.query({
            query: GetCourseTitleDocument,
            variables: {
              subject: course.subject,
              number: course.courseNumber,
            },
            fetchPolicy: "cache-first",
          });

          const courseId = courseResult.data?.course?.courseId;
          if (!courseId) continue;

          // Query targeted messages for this courseId
          const { data } =
            await client.query<GetTargetedMessagesForCourseQuery>({
              query: GetTargetedMessagesForCourseDocument,
              variables: { courseId },
              fetchPolicy: "cache-first",
            });

          const messages = data?.targetedMessagesForCourse;
          if (!messages?.length) continue;

          syncDismissedTargetedMessages(messages.map((m) => m.id));

          const message = messages.find((m) => {
            if (!m.persistent && !m.reappearing)
              return !isTargetedMessageDismissed(m.id);
            if (m.reappearing)
              return !isTargetedMessageSessionDismissed(m.id);
            return true;
          });

          if (message) {
            if (!cancelled)
              setResolved({
                message,
                courseId,
                courseNumber: course.courseNumber,
              });
            return;
          }
        } catch {
          // continue to next course
        }
      }

      if (!cancelled) setResolved(null);
    };

    void findMessage();

    return () => {
      cancelled = true;
    };
  }, [client, coursesKey]);

  const message = useMemo(() => {
    if (!resolved) return null;
    if (localDismissed.has(resolved.message.id)) return null;
    return resolved;
  }, [resolved, localDismissed]);

  if (!message) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLocalDismissed((prev) => new Set(prev).add(message.message.id));
    incrementDismiss(message.message.id);

    if (message.message.reappearing) {
      markTargetedMessageAsSessionDismissed(message.message.id);
    } else if (!message.message.persistent) {
      markTargetedMessageAsDismissed(message.message.id);
    }
  };

  return (
    <a
      href={`/message/click/${message.message.id}?courseId=${message.courseId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.messageBox}
    >
      <div className={styles.messageHeader}>
        <p className={styles.messageTitle}>
          Taking {message.courseNumber}?
        </p>
        {!message.message.persistent && (
          <button
            className={styles.dismissButton}
            onClick={handleDismiss}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        )}
      </div>
      {message.message.description && (
        <p className={styles.messageDescription}>
          {message.message.description}
        </p>
      )}
      <div className={styles.applyButton}>
        {message.message.linkText || "Learn more"}{" "}
        <ArrowUpRight width={14} height={14} />
      </div>
    </a>
  );
}
