import * as Dialog from "@radix-ui/react-dialog";
import styles from "./ConfirmationPopup.module.scss";
import { CheckCircleSolid } from "iconoir-react";

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
                            <CheckCircleSolid />
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