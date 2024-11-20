import * as Dialog from "@radix-ui/react-dialog";
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
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#3B82F6"/>
                                <path d="M34.6666 16L19.9999 30.6667L13.3333 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
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