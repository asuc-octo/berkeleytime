import * as React from "react";

import classNames from "classnames";
import { Toast as ToastPrimitive } from "radix-ui";

import styles from "./Toast.module.scss";

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

function Toast({
  open,
  onOpenChange,
  title,
  action,
  duration = 8000,
}: ToastProps) {
  return (
    <ToastPrimitive.Root
      className={styles.root}
      open={open}
      onOpenChange={onOpenChange}
      duration={duration}
    >
      <ToastPrimitive.Title className={styles.title}>
        {title}
      </ToastPrimitive.Title>

      {action && (
        <ToastPrimitive.Action
          className={styles.action}
          altText={action.label}
          onClick={action.onClick}
        >
          {action.label}
        </ToastPrimitive.Action>
      )}
    </ToastPrimitive.Root>
  );
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      className={classNames(styles.viewport, className)}
      {...props}
    />
  );
}

function ToastProvider({
  children,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return (
    <ToastPrimitive.Provider swipeDirection="down" {...props}>
      {children}
    </ToastPrimitive.Provider>
  );
}

export { Toast, ToastViewport, ToastProvider };
export type { ToastProps };
