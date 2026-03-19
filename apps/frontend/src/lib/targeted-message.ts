/**
 * Interface for managing dismissed targeted messages in localStorage and sessionStorage.
 * Tracks which targeted messages have been dismissed by the user.
 */

const STORAGE_KEY = "dismissed-targeted-messages";
const SESSION_STORAGE_KEY = "session-dismissed-targeted-messages";

/**
 * Get all dismissed targeted message IDs from localStorage.
 */
export const getDismissedTargetedMessages = (): string[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return [];
    return JSON.parse(item) as string[];
  } catch {
    return [];
  }
};

/**
 * Check if a targeted message has been dismissed (permanently).
 */
export const isTargetedMessageDismissed = (messageId: string): boolean => {
  const dismissed = getDismissedTargetedMessages();
  return dismissed.includes(messageId);
};

/**
 * Mark a targeted message as dismissed (permanently via localStorage).
 */
export const markTargetedMessageAsDismissed = (messageId: string): void => {
  const dismissed = getDismissedTargetedMessages();
  if (!dismissed.includes(messageId)) {
    dismissed.push(messageId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  }
};

/**
 * Remove any dismissed targeted message IDs that are no longer returned by the backend.
 */
export const syncDismissedTargetedMessages = (
  activeMessageIds: string[]
): void => {
  try {
    const dismissed = getDismissedTargetedMessages();
    const activeSet = new Set(activeMessageIds);
    const filtered = dismissed.filter((id) => activeSet.has(id));

    if (filtered.length !== dismissed.length) {
      if (filtered.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    }
  } catch {
    // Ignore sync errors; localStorage is best-effort
  }
};

/**
 * Get all session-dismissed targeted message IDs from sessionStorage.
 * Used for reappearing messages that should reappear on new tabs.
 */
export const getSessionDismissedTargetedMessages = (): string[] => {
  try {
    const item = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!item) return [];
    return JSON.parse(item) as string[];
  } catch {
    return [];
  }
};

/**
 * Check if a targeted message has been dismissed in this session.
 */
export const isTargetedMessageSessionDismissed = (
  messageId: string
): boolean => {
  const dismissed = getSessionDismissedTargetedMessages();
  return dismissed.includes(messageId);
};

/**
 * Mark a targeted message as dismissed in this session (sessionStorage).
 */
export const markTargetedMessageAsSessionDismissed = (
  messageId: string
): void => {
  const dismissed = getSessionDismissedTargetedMessages();
  if (!dismissed.includes(messageId)) {
    dismissed.push(messageId);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dismissed));
  }
};
