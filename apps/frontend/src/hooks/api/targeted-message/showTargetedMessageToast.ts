import type { ApolloClient } from "@apollo/client";
import { toast } from "sonner";

import "@/lib/api/targeted-message";
import {
  GetTargetedMessagesForCourseDocument,
  GetTargetedMessagesForCourseQuery,
  IncrementTargetedMessageDismissDocument,
} from "@/lib/generated/graphql";
import {
  isTargetedMessageDismissed,
  isTargetedMessageSessionDismissed,
  markTargetedMessageAsDismissed,
  markTargetedMessageAsSessionDismissed,
  syncDismissedTargetedMessages,
} from "@/lib/targeted-message";

// Persists for the entire page session — prevents re-showing the same ad
const shownMessageIds = new Set<string>();

export const showTargetedMessageToast = async (
  client: ApolloClient,
  courseId: string
) => {
  if (!courseId) return;

  const { data } = await client.query<GetTargetedMessagesForCourseQuery>({
    query: GetTargetedMessagesForCourseDocument,
    variables: { courseId },
    fetchPolicy: "cache-first",
  });

  const messages = data?.targetedMessagesForCourse;
  if (!messages?.length) return;

  syncDismissedTargetedMessages(messages.map((m) => m.id));

  const message = messages.find((m) => {
    if (!m.persistent && !m.reappearing)
      return !isTargetedMessageDismissed(m.id);
    if (m.reappearing) return !isTargetedMessageSessionDismissed(m.id);
    return true; // persistent always shows
  });

  if (!message) return;

  // Never show the same message twice in one page session
  if (shownMessageIds.has(message.id)) return;
  shownMessageIds.add(message.id);

  toast(message.title, {
    description: message.description ?? undefined,
    duration: 8000,
    action: message.link
      ? {
          label: message.linkText || "Learn more",
          onClick: () => {
            window.open(
              `/message/click/${message.id}?courseId=${courseId}`,
              "_blank"
            );
          },
        }
      : undefined,
    onDismiss: () => {
      client.mutate({
        mutation: IncrementTargetedMessageDismissDocument,
        variables: { messageId: message.id },
      });
      if (message.reappearing) {
        markTargetedMessageAsSessionDismissed(message.id);
      } else if (!message.persistent) {
        markTargetedMessageAsDismissed(message.id);
      }
    },
  });
};
