import { VisuallyHidden } from "@radix-ui/themes";
import classNames from "classnames";
import { CheckCircleSolid, XmarkCircleSolid } from "iconoir-react";

import { Button, Dialog } from "@repo/theme";

import styles from "./CommentDialogs.module.scss";

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function SuccessDialog({
  isOpen,
  onClose,
  title,
  message,
}: CommentDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <VisuallyHidden>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{message}</Dialog.Description>
          </VisuallyHidden>
          <Dialog.Body className={styles.body}>
            <CheckCircleSolid
              className={classNames(styles.icon, styles.iconSuccess)}
            />
            <div className={styles.title}>{title}</div>
            <div className={styles.message}>{message}</div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={onClose}>Done</Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ErrorDialog({
  isOpen,
  onClose,
  title,
  message,
}: CommentDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <VisuallyHidden>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{message}</Dialog.Description>
          </VisuallyHidden>
          <Dialog.Body className={styles.body}>
            <XmarkCircleSolid
              className={classNames(styles.icon, styles.iconError)}
            />
            <div className={styles.title}>{title}</div>
            <div className={styles.message}>{message}</div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={onClose}>Close</Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
