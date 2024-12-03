import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircleSolid } from "iconoir-react";

import styles from "./ConfirmationPopup.module.scss";

interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfirmationPopup({
  isOpen,
  onClose,
}: ConfirmationPopupProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modal}>
          <div className={styles.content}>
            <div className={styles.modalIcon}>
              <CheckCircleSolid width={70} height={70} color="var(--blue-500)" />
            </div>

            <div className={styles.modalHeader}>
              <Dialog.Title className={styles.modalTitle}>
                Thank you for your input!
              </Dialog.Title>
              <Dialog.Description className={styles.modalSubtitle}>
                Your contribution will help students make better
              </Dialog.Description>
              <Dialog.Description className={styles.modalSubtitle}>
                informed decisions when selecting their courses.
              </Dialog.Description>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={onClose} className={styles.doneButton}>
                Done
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
