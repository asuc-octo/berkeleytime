import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@repo/theme";
import styles from "./ConfirmationPopup.module.scss";
interface ConfirmationPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ConfirmationPopup({ isOpen, onClose }: ConfirmationPopupProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.modal}>
                    <div className={styles.modalHeader}>
                        <Dialog.Title className={styles.modalTitle}>Thank you for your input!</Dialog.Title>
                        <Dialog.Description className={styles.modalSubtitle}>
                            Our moderators will take a look at your suggestions and verify the information.
                        </Dialog.Description>
                    </div>
                    <div className={styles.modalFooter}>
                        <Button onClick={onClose}>Done</Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
