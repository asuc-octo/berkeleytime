/**
 * Notification-related types for course enrollment tracking
 */

import { IClass } from "@/lib/api/classes";

/**
 * Supported enrollment threshold percentages
 */
export type NotificationThreshold = 50 | 75 | 90;

/**
 * All possible threshold values as a const array for validation
 */
export const NOTIFICATION_THRESHOLDS: readonly NotificationThreshold[] = [50, 75, 90] as const;

/**
 * Monitored class with notification thresholds
 * Re-exported for consistency with backend types
 */
export interface IMonitoredClass {
  class: IClass;
  thresholds: number[];
}

/**
 * Class identifier for notification operations
 */
export interface ClassIdentifier {
  subject: string;
  courseNumber: string;
  number: string;
  year: number;
  semester: string;
}

/**
 * Props for notification button variants
 */
export type NotificationButtonVariant = "iconButton" | "card";

/**
 * Threshold change callback type
 */
export type OnThresholdChange = (threshold: number, checked: boolean) => void | Promise<void>;

/**
 * Remove class callback type
 */
export type OnRemoveClass = () => void | Promise<void>;
