import { ReactNode } from "react";

import { Progress } from "radix-ui";

import { Dialog } from "@repo/theme";

import styles from "./UserFeedbackModal.module.scss";

interface RatingModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  progress: number;
  children: ReactNode;
  footer: ReactNode;
  modalBodyClassName?: string;
}

export function RatingModalLayout({
  isOpen,
  onClose,
  title,
  subtitle,
  progress,
  children,
  footer,
  modalBodyClassName,
}: RatingModalLayoutProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card style={{ width: "auto" }}>
          <div className={styles.modalHeaderWrapper}>
            <Dialog.Header
              title={title}
              subtitle={subtitle}
              hasCloseButton
              className={styles.modalHeader}
            />
            <Progress.Root
              className={styles.progressBar}
              value={progress}
              max={100}
            >
              <Progress.Indicator
                className={styles.progressIndicator}
                style={{ transform: `translateX(-${100 - progress}%)` }}
              />
            </Progress.Root>
          </div>
          <Dialog.Body className={modalBodyClassName || styles.modalBody}>
            {children}
          </Dialog.Body>
          <Dialog.Footer>{footer}</Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
