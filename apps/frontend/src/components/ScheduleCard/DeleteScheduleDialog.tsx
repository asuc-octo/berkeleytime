import { ReactNode, useState } from "react";

import { VisuallyHidden } from "@radix-ui/themes";
import classNames from "classnames";
import { WarningTriangleSolid } from "iconoir-react";

import { Button, Dialog } from "@repo/theme";

import styles from "./DeleteScheduleDialog.module.scss";

interface DeleteScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  onConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteScheduleDialog({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Yes, delete",
  cancelText,
}: DeleteScheduleDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
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
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>
              {typeof message === "string" ? message : title}
            </Dialog.Description>
          </VisuallyHidden>
          <Dialog.Body className={styles.body}>
            <WarningTriangleSolid
              className={classNames(styles.icon, styles.iconWarning)}
            />
            <div className={styles.title}>{title}</div>
            <div className={styles.message}>{message}</div>
          </Dialog.Body>
          <Dialog.Footer>
            {!isProcessing && cancelText && (
              <Button
                onClick={onClose}
                variant="tertiary"
                style={{ color: "var(--paragraph-color)" }}
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              isDelete={true}
            >
              {isProcessing ? "Processing..." : confirmText}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
