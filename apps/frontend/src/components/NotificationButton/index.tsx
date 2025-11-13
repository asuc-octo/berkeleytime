import { useCallback, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { BellNotification, BellNotificationSolid, NavArrowDown, Check } from "iconoir-react";
import { Popover, Checkbox } from "radix-ui";
import { Flex, IconButton, Text, Tooltip, Button } from "@repo/theme";

import {
  NOTIFICATION_THRESHOLDS,
  NotificationButtonVariant,
  OnRemoveClass,
  OnThresholdChange,
} from "@/types/notifications";

import styles from "./NotificationButton.module.scss";

export interface NotificationButtonProps {
  /**
   * Current notification thresholds (50, 75, 90)
   */
  thresholds: number[];

  /**
   * Callback when threshold is toggled
   */
  onThresholdsChange: OnThresholdChange;

  /**
   * Callback when all thresholds are removed (optional)
   */
  onRemove?: OnRemoveClass;

  /**
   * Unique identifier for checkbox IDs
   */
  uniqueId: string;

  /**
   * UI variant: iconButton (Class component) or card (NotificationClassCard)
   */
  variant?: NotificationButtonVariant;

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Reusable notification button component with Radix Popover
 * Supports two variants:
 * - iconButton: For use in Class component header
 * - card: For use in NotificationClassCard
 */
export default function NotificationButton({
  thresholds,
  onThresholdsChange,
  onRemove,
  uniqueId,
  variant = "iconButton",
  disabled = false,
  className,
}: NotificationButtonProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [tempThresholds, setTempThresholds] = useState<number[]>(thresholds);

  const isActive = thresholds.length > 0;

  // Sync temp thresholds with prop changes
  useEffect(() => {
    setTempThresholds(thresholds);
  }, [thresholds]);

  const handleTempThresholdChange = useCallback((threshold: number, checked: boolean) => {
    setTempThresholds((prev) => {
      if (checked) {
        return [...prev, threshold].sort((a, b) => a - b);
      } else {
        return prev.filter((t) => t !== threshold);
      }
    });
  }, []);

  const applyThresholdChanges = useCallback(() => {
    // Add new thresholds
    tempThresholds.forEach((threshold) => {
      if (!thresholds.includes(threshold)) {
        onThresholdsChange(threshold, true);
      }
    });

    // Remove old thresholds
    thresholds.forEach((threshold) => {
      if (!tempThresholds.includes(threshold)) {
        onThresholdsChange(threshold, false);
      }
    });
  }, [tempThresholds, thresholds, onThresholdsChange]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setShowPopup(open);

      // When closing the popover, handle threshold changes
      if (!open) {
        // If user removed all thresholds and there were some before, show confirmation
        if (tempThresholds.length === 0 && thresholds.length > 0 && onRemove) {
          setShowRemoveConfirmation(true);
        } else {
          applyThresholdChanges();
        }
      }
    },
    [tempThresholds, thresholds, onRemove, applyThresholdChanges]
  );

  const tooltipContent = useMemo(() => {
    if (disabled) return "Notification disabled";
    return isActive ? "Manage notifications" : "Notify me";
  }, [disabled, isActive]);

  const buttonClassName = classNames(
    styles.button,
    {
      [styles.active]: isActive,
      [styles.iconButton]: variant === "iconButton",
      [styles.card]: variant === "card",
    },
    className
  );

  return (
    <>
      <Popover.Root open={showPopup} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <Tooltip content={tooltipContent}>
            {variant === "iconButton" ? (
              <IconButton
                className={buttonClassName}
                disabled={disabled}
                aria-label={tooltipContent}
              >
                <Flex align="center" gap="1">
                  {isActive ? (
                    <BellNotificationSolid width={16} height={16} aria-hidden="true" />
                  ) : (
                    <BellNotification width={16} height={16} aria-hidden="true" />
                  )}
                  <NavArrowDown
                    width={14}
                    height={14}
                    className={classNames(styles.arrow, { [styles.arrowRotated]: showPopup })}
                    aria-hidden="true"
                  />
                </Flex>
              </IconButton>
            ) : (
              <div
                className={buttonClassName}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={tooltipContent}
                aria-expanded={showPopup}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowPopup(!showPopup);
                  }
                }}
              >
                {isActive ? (
                  <BellNotificationSolid width={16} height={16} aria-hidden="true" />
                ) : (
                  <BellNotification width={16} height={16} aria-hidden="true" />
                )}
                <NavArrowDown
                  width={14}
                  height={14}
                  className={classNames(styles.arrow, { [styles.arrowRotated]: showPopup })}
                  aria-hidden="true"
                />
              </div>
            )}
          </Tooltip>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align={variant === "iconButton" ? "start" : "end"}
            sideOffset={8}
            className={styles.popoverContent}
            onEscapeKeyDown={() => {
              setTempThresholds(thresholds); // Reset on escape
              setShowPopup(false);
            }}
          >
            <Flex direction="column" style={{ gap: "10px" }}>
              {NOTIFICATION_THRESHOLDS.map((threshold) => (
                <label key={threshold} className={styles.checkboxLabel}>
                  <Checkbox.Root
                    id={`${uniqueId}-${threshold}`}
                    className={styles.checkbox}
                    checked={tempThresholds.includes(threshold)}
                    onCheckedChange={(checked) =>
                      handleTempThresholdChange(threshold, checked as boolean)
                    }
                  >
                    <Checkbox.Indicator asChild>
                      <Check width={12} height={12} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <Text size="sm">When {threshold}% full</Text>
                </label>
              ))}
            </Flex>
            <Popover.Arrow className={styles.popoverArrow} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {onRemove && showRemoveConfirmation && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationDialog}>
            <Text className={styles.confirmationTitle}>
              Stop tracking this class?
            </Text>
            <Text className={styles.confirmationMessage}>
              This will remove all notification thresholds for this class.
            </Text>
            <Flex gap="2" justify="end" style={{ marginTop: 16 }}>
              <Button
                variant="ghost"
                onClick={() => {
                  setTempThresholds(thresholds); // Reset to original thresholds
                  setShowRemoveConfirmation(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await onRemove();
                  setShowRemoveConfirmation(false);
                }}
              >
                Stop Tracking
              </Button>
            </Flex>
          </div>
        </div>
      )}
    </>
  );
}
