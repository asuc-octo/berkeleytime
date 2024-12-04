import * as Dialog from "@radix-ui/react-dialog";
import { WarningCircle } from "iconoir-react";

import styles from "./ConfirmationPopup.module.scss";

interface DeleteRatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export default function DeleteRatingPopup({
                                            isOpen,
                                            onClose,
                                            onConfirmDelete,
                                          }: DeleteRatingPopupProps) {
  return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.modal}>
            <div className={styles.content}>
              <div className={styles.modalIcon}>
                <WarningCircle width={70} height={70} color="var(--red-500)" />
              </div>

              <div className={styles.modalHeader}>
                <Dialog.Title className={styles.modalTitle}>
                  Delete Rating
                </Dialog.Title>
                <Dialog.Description className={styles.modalSubtitle}>
                  This rating will be removed from your profile and will not be included in the overall class ratings.
                </Dialog.Description>
              </div>

              <div className={styles.modalFooter}>
                <button onClick={onClose} >
                  No, keeping my rating
                </button>
                <button onClick={onConfirmDelete} className={styles.doneButton}
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                            height: "100%",
                          padding: "10px 20px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}>
                  Yes, delete
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
  );
}
