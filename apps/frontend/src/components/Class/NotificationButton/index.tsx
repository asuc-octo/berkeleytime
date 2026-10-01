import { useState } from "react";

import {
  Bell,
  BellNotificationSolid,
  Check,
  NavArrowDown,
  NavArrowUp,
} from "iconoir-react";

import { DropdownMenu, IconButton, Tooltip, useToast } from "@repo/theme";

import {
  MonitoredClassRef,
  useMonitoredClasses,
} from "@/hooks/api/users/useMonitoredClasses";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";
import { NotificationEvent } from "@/lib/generated/graphql";
import {
  ALL_NOTIFICATION_EVENTS,
  describeNotificationEvents,
  getNotificationEventLabel,
} from "@/lib/notifications";

import styles from "./NotificationButton.module.scss";
import { StopNotificationsDialog } from "./StopNotificationsDialog";

interface NotificationButtonProps {
  classInfo?: MonitoredClassRef;
  disabled?: boolean;
}

export default function NotificationButton({
  classInfo,
  disabled = false,
}: NotificationButtonProps) {
  const { user } = useUser();
  const { getMonitoredClass, subscribe, setEvents, unsubscribe, saving } =
    useMonitoredClasses();
  const showToast = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);

  const monitoredClass = classInfo ? getMonitoredClass(classInfo) : undefined;
  const classLabel = classInfo
    ? `${classInfo.subject} ${classInfo.courseNumber}`
    : "";

  const save = async (action: () => Promise<void>, message: string) => {
    try {
      await action();
      showToast({ message });
    } catch {
      showToast({
        message: "Couldn't update your notifications. Please try again.",
        variant: "error",
      });
    }
  };

  const handleSubscribe = () => {
    if (!user) {
      signIn();
      return;
    }
    if (!classInfo) return;

    save(
      () => subscribe(classInfo),
      describeNotificationEvents(ALL_NOTIFICATION_EVENTS, classLabel)
    );
  };

  const handleToggle = (event: NotificationEvent, checked: boolean) => {
    if (!classInfo || !monitoredClass) return;

    const events = ALL_NOTIFICATION_EVENTS.filter((e) =>
      e === event ? checked : monitoredClass.events.includes(e)
    );

    // Unchecking everything is the same as unsubscribing
    if (events.length === 0) {
      setMenuOpen(false);
      setStopDialogOpen(true);
      return;
    }

    save(
      () => setEvents(classInfo, events),
      describeNotificationEvents(events, classLabel)
    );
  };

  const handleStop = async () => {
    if (!classInfo) return;

    await save(
      () => unsubscribe(classInfo),
      `You'll no longer be notified about ${classLabel}.`
    );
    setStopDialogOpen(false);
  };

  if (!monitoredClass) {
    const label = "Notify me about enrollment changes";

    return (
      <Tooltip
        title={label}
        trigger={
          <IconButton
            aria-label={label}
            disabled={disabled || !classInfo || saving}
            onClick={handleSubscribe}
          >
            <Bell />
          </IconButton>
        }
      />
    );
  }

  return (
    <>
      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <IconButton
            aria-label="Notification settings"
            className={styles.active}
            disabled={disabled}
          >
            <BellNotificationSolid width={16} height={16} />
            {menuOpen ? (
              <NavArrowUp width={14} height={14} />
            ) : (
              <NavArrowDown width={14} height={14} />
            )}
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" sideOffset={8}>
          {ALL_NOTIFICATION_EVENTS.map((event) => {
            const checked = monitoredClass.events.includes(event);

            return (
              <DropdownMenu.CheckboxItem
                key={event}
                className={styles.item}
                checked={checked}
                disabled={saving}
                onCheckedChange={(checked) => handleToggle(event, checked)}
                // Keep the menu open so several events can be changed at once
                onSelect={(e) => e.preventDefault()}
              >
                <span className={styles.checkbox} data-checked={checked}>
                  {checked && <Check width={12} height={12} />}
                </span>
                {getNotificationEventLabel(event)}
              </DropdownMenu.CheckboxItem>
            );
          })}
          <DropdownMenu.Separator className={styles.separator} />
          <DropdownMenu.Item
            isDelete
            disabled={saving}
            onSelect={() => setStopDialogOpen(true)}
          >
            Stop notifications
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <StopNotificationsDialog
        isOpen={stopDialogOpen}
        onClose={() => setStopDialogOpen(false)}
        onConfirm={handleStop}
      />
    </>
  );
}
