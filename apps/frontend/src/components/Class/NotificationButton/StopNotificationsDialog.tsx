import { useState } from "react";

import { VisuallyHidden } from "@radix-ui/themes";
import { WarningTriangleSolid } from "iconoir-react";

import { Button, Dialog } from "@repo/theme";

import styles from "./StopNotificationsDialog.module.scss";

interface StopNotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function StopNotificationsDialog({
  isOpen,
  onClose,
  onConfirm,
}: StopNotificationsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <VisuallyHidden>
            <Dialog.Title>Stop Notifications</Dialog.Title>
            <Dialog.Description>
              You will no longer receive any notifications for this course.
            </Dialog.Description>
          </VisuallyHidden>
          <Dialog.Body className={styles.body}>
            <WarningTriangleSolid className={styles.icon} />
            <div className={styles.title}>
              Stop Notifications for this Course?
            </div>
            <div className={styles.message}>
              You will no longer receive any notifications for this course
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            {!isProcessing && (
              <Button
                onClick={onClose}
                variant="tertiary"
                style={{ color: "var(--paragraph-color)" }}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              isDelete={true}
            >
              {isProcessing ? "Stopping..." : "Stop Notifications"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
