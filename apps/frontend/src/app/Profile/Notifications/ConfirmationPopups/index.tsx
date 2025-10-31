import { useState } from "react";

import classNames from "classnames";
import {
  ArrowRight,
  CheckCircleSolid,
  WarningTriangleSolid,
} from "iconoir-react";

import { Button, Dialog } from "@repo/theme";

import styles from "./ConfirmationPopups.module.scss";

interface RemoveClassPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRemove: () => Promise<void>;
}

export function RemoveClassPopup({
  isOpen,
  onClose,
  onConfirmRemove,
}: RemoveClassPopupProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onConfirmRemove();
      onClose();
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Body className={styles.body}>
            <WarningTriangleSolid
              className={classNames(styles.icon, styles.red)}
            />
            <div className={styles.title}>Stop Tracking Class</div>
            <div className={styles.subtitle}>
              You will no longer receive notifications about <br />
              enrollment changes for this class.
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            {!isRemoving && (
              <Button onClick={onClose} variant="tertiary" isDelete>
                Cancel
              </Button>
            )}
            <Button onClick={handleRemove} disabled={isRemoving} isDelete>
              {isRemoving ? "Removing..." : "Yes, stop tracking"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
