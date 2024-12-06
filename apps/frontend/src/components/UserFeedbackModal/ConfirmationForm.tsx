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
            <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M35 61.25C38.4472 61.25 41.8606 60.571 45.0454 59.2518C48.2302 57.9327 51.124 55.9991 53.5616 53.5616C55.9991 51.124 57.9327 48.2302 59.2518 45.0454C60.571 41.8606 61.25 38.4472 61.25 35C61.25 31.5528 60.571 28.1394 59.2518 24.9546C57.9327 21.7698 55.9991 18.876 53.5616 16.4384C51.124 14.0009 48.2302 12.0673 45.0454 10.7482C41.8606 9.42898 38.4472 8.75 35 8.75C28.0381 8.75 21.3613 11.5156 16.4384 16.4384C11.5156 21.3613 8.75 28.0381 8.75 35C8.75 41.9619 11.5156 48.6387 16.4384 53.5616C21.3613 58.4844 28.0381 61.25 35 61.25Z" fill="#3B82F6"/>
            <path d="M34.3233 45.6167L48.9067 28.1167L44.4267 24.3833L31.885 39.4304L25.3954 32.9379L21.2713 37.0621L30.0213 45.8121L32.2788 48.0696L34.3233 45.6167Z" fill="white"/>
          </svg>
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
