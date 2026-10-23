import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import classNames from "classnames";
import { Toast as Primitive } from "radix-ui";

import styles from "./Toast.module.scss";

export interface ToastOptions {
  message: ReactNode;
  variant?: "info" | "error";
}

const ToastContext = createContext<(options: ToastOptions) => void>(() => {});

interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
}

// Toasts appear in the ToastViewport rendered inside this provider
export function ToastProvider({
  children,
  duration = 5000,
}: ToastProviderProps) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const nextId = useRef(0);

  // Only one toast is visible at a time; a new one replaces the current one
  const showToast = useCallback((options: ToastOptions) => {
    setToast({ ...options, id: nextId.current++ });
    setOpen(true);
  }, []);

  return (
    <ToastContext value={showToast}>
      <Primitive.Provider duration={duration} swipeDirection="down">
        {children}
        {toast && (
          <Primitive.Root
            key={toast.id}
            open={open}
            onOpenChange={setOpen}
            className={styles.root}
            data-variant={toast.variant ?? "info"}
          >
            <Primitive.Description>{toast.message}</Primitive.Description>
          </Primitive.Root>
        )}
      </Primitive.Provider>
    </ToastContext>
  );
}

interface ToastViewportProps {
  // "container" pins toasts to the bottom of the element the viewport is
  // rendered in, "viewport" to the bottom of the window
  position?: "container" | "viewport";
  className?: string;
}

export function ToastViewport({
  position = "viewport",
  className,
}: ToastViewportProps) {
  return (
    <Primitive.Viewport
      className={classNames(styles.viewport, className)}
      data-position={position}
    />
  );
}

export const useToast = () => useContext(ToastContext);
