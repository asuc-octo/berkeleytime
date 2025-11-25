import { ReactNode, useState } from "react";

import { VisuallyHidden } from "@radix-ui/themes";
import classNames from "classnames";
import {
  CheckCircleSolid,
  WarningTriangleSolid,
  XmarkCircleSolid,
} from "iconoir-react";

import { Button, Dialog } from "@repo/theme";

import styles from "./RatingDialog.module.scss";

type DialogVariant = "success" | "error" | "warning";

interface BaseRatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: DialogVariant;
  title: string;
  message: string | ReactNode;
}

interface ConfirmDialogProps extends BaseRatingDialogProps {
  variant: "warning";
  onConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

interface InfoDialogProps extends BaseRatingDialogProps {
  variant: "success" | "error";
  buttonText?: string;
}

type RatingDialogProps = ConfirmDialogProps | InfoDialogProps;

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircleSolid,
    iconClassName: styles.iconSuccess,
    defaultButtonText: "Done",
  },
  error: {
    icon: XmarkCircleSolid,
    iconClassName: styles.iconError,
    defaultButtonText: "Close",
  },
  warning: {
    icon: WarningTriangleSolid,
    iconClassName: styles.iconWarning,
    defaultButtonText: "Yes, delete",
  },
} as const;

export function RatingDialog(props: RatingDialogProps) {
  const { isOpen, onClose, variant, title, message } = props;
  const [isProcessing, setIsProcessing] = useState(false);

  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;

  const handleConfirm = async () => {
    if (props.variant === "warning") {
      setIsProcessing(true);
      try {
        await props.onConfirm();
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const isConfirmDialog = props.variant === "warning";
  const buttonText =
    props.variant === "warning"
      ? props.confirmText || config.defaultButtonText
      : props.buttonText || config.defaultButtonText;
  const cancelText = props.variant === "warning" ? props.cancelText : undefined;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <VisuallyHidden>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>
              {typeof message === "string" ? message : title}
            </Dialog.Description>
          </VisuallyHidden>
          <Dialog.Body className={styles.body}>
            <IconComponent
              className={classNames(styles.icon, config.iconClassName)}
            />
            <div className={styles.title}>{title}</div>
            <div className={styles.message}>{message}</div>
          </Dialog.Body>
          <Dialog.Footer>
            {isConfirmDialog && !isProcessing && cancelText && (
              <Button
                onClick={onClose}
                variant="tertiary"
                style={{ color: "var(--paragraph-color)" }}
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={isConfirmDialog ? handleConfirm : onClose}
              disabled={isProcessing}
              variant={variant === "error" ? "tertiary" : undefined}
              style={
                variant === "error"
                  ? { color: "var(--paragraph-color)" }
                  : undefined
              }
              {...(isConfirmDialog && { isDelete: true })}
            >
              {isProcessing ? "Processing..." : buttonText}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Convenience wrappers for backward compatibility and cleaner API
interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
  title?: string;
}

export function ErrorDialog({
  isOpen,
  onClose,
  errorMessage = "An error occurred, please try again later",
  title = "Error Occurred",
}: ErrorDialogProps) {
  return (
    <RatingDialog
      isOpen={isOpen}
      onClose={onClose}
      variant="error"
      title={title}
      message={errorMessage}
    />
  );
}

interface SubmitRatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitRatingPopup({ isOpen, onClose }: SubmitRatingPopupProps) {
  return (
    <RatingDialog
      isOpen={isOpen}
      onClose={onClose}
      variant="success"
      title="Thank you for your input!"
      message={
        <>
          Your contribution will help students make better <br />
          informed decisions when selecting their courses.
        </>
      }
    />
  );
}

interface DeleteRatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export function DeleteRatingPopup({
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteRatingPopupProps) {
  return (
    <RatingDialog
      isOpen={isOpen}
      onClose={onClose}
      variant="warning"
      title="Delete Rating"
      message={
        <>
          This rating will be removed from your profile and <br />
          will not be included in the overall class ratings.
        </>
      }
      onConfirm={onConfirmDelete}
      confirmText="Yes, delete"
      cancelText="No, keep my rating"
    />
  );
}
