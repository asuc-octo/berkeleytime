import { Toast } from "radix-ui";

import { Button } from "@repo/theme";

import styles from "./ConfirmationToast.module.scss";

interface ConfirmationToastProps {
  message: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function ConfirmationToast({
  message,
  open,
  onOpenChange,
  showButton = false,
  buttonText = "Add notes",
  onButtonClick,
}: ConfirmationToastProps) {
  return (
    <Toast.Provider swipeDirection="right" duration={Infinity}>
      <Toast.Root
        className={styles.toast}
        open={open}
        onOpenChange={onOpenChange}
        duration={Infinity}
      >
        <Toast.Description className={styles.description}>
          <span className={styles.message}>{message}</span>
          {showButton && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={onButtonClick}
              className={styles.button}
            >
              {buttonText}
            </Button>
          )}
        </Toast.Description>
      </Toast.Root>
      <Toast.Viewport className={styles.viewport} />
    </Toast.Provider>
  );
}
