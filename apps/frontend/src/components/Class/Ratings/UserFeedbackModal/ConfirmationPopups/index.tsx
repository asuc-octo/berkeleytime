import { useState } from "react";

import { VisuallyHidden } from "@radix-ui/themes";
import classNames from "classnames";
import {
  ArrowRight,
  CheckCircleSolid,
  WarningTriangleSolid,
} from "iconoir-react";

import { Button, Dialog } from "@repo/theme";

import styles from "./ConfirmationPopups.module.scss";

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
        <Dialog.Overlay />
        <Dialog.Card>
          <VisuallyHidden>
            <Dialog.Title>Thank you for your input!</Dialog.Title>
            <Dialog.Description>
              Your rating helps other students make better decisions.
            </Dialog.Description>
          </VisuallyHidden>
          <Dialog.Body className={styles.body}>
            <CheckCircleSolid className={styles.icon} />
            <div className={styles.title}>Thank you for your input!</div>
            <div className={styles.subtitle}>
              Your contribution will help students make better <br />
              informed decisions when selecting their courses.
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={onClose}>
              Done
              <ArrowRight />
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
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
        <Dialog.Overlay />
        <Dialog.Card>
          <VisuallyHidden>
            <Dialog.Title>Delete Rating</Dialog.Title>
            <Dialog.Description>
              Removing this rating also removes it from the class aggregate.
            </Dialog.Description>
          </VisuallyHidden>
          <Dialog.Body className={styles.body}>
            <WarningTriangleSolid
              className={classNames(styles.icon, styles.red)}
            />
            <div className={styles.title}>Delete Rating</div>
            <div className={styles.subtitle}>
              This rating will be removed from your profile and <br />
              will not be included in the overall class ratings.
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            {!isDeleting && (
              <Button
                onClick={onClose}
                variant="tertiary"
                style={{ color: "var(--paragraph-color)" }}
                isDelete
              >
                No, keep my rating
              </Button>
            )}
            <Button onClick={handleDelete} disabled={isDeleting} isDelete>
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
