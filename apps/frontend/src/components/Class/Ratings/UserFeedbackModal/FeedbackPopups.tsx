import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircleSolid, WarningTriangleSolid } from "iconoir-react";

import styles from "./Popup.module.scss";

interface SubmitRatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeleteRatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export function SubmitRatingPopup({ isOpen, onClose }: SubmitRatingPopupProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modal}>
          <div className={styles.content}>
            <div className={styles.modalIcon}>
              <CheckCircleSolid
                width={70}
                height={70}
                color="var(--blue-500)"
              />
            </div>
            <div className={styles.modalHeader}>
              <Dialog.Title className={styles.modalTitle}>
                Thank you for your input!
              </Dialog.Title>
              <Dialog.Description className={styles.modalSubtitle}>
                Your contribution will help students make better <br />
                informed decisions when selecting their courses.
              </Dialog.Description>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={onClose}
                className={styles.doneButton}
                style={{
                  height: "32px",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DeleteRatingPopup({
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteRatingPopupProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modal}>
          <div className={styles.content}>
            <div className={styles.modalIcon}>
              <WarningTriangleSolid
                width={70}
                height={70}
                color="var(--red-500)"
              />
            </div>

            <div className={styles.modalHeader}>
              <Dialog.Title className={styles.modalTitle}>
                Delete Rating
              </Dialog.Title>
              <Dialog.Description className={styles.modalSubtitle}>
                This rating will be removed from your profile and <br />
                will not be included in the overall class ratings.
              </Dialog.Description>
            </div>

            <div className={styles.modalFooter}>
              {!isDeleting && (
                <button
                  onClick={onClose}
                  className={styles.keepButton}
                >
                  No, keep my rating
                </button>
              )}
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
