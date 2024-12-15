import * as Dialog from "@radix-ui/react-dialog";
import { WarningTriangleSolid } from "iconoir-react";
import { useState } from "react";

import styles from "./ConfirmationPopup.module.scss";

interface DeleteRatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export default function DeleteRatingPopup({
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
                  style={{
                    color: "var(--subtitle-color)",
                    cursor: "pointer",
                  }}
                >
                  No, keep my rating
                </button>
              )}
              <button
                onClick={handleDelete}
                className={styles.doneButton}
                disabled={isDeleting}
                style={{
                  backgroundColor: "var(--red-500)",
                  color: "white",
                  border: "none",
                  height: "32px",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: isDeleting ? "default" : "pointer",
                  opacity: isDeleting ? 0.7 : 1,
                }}
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
