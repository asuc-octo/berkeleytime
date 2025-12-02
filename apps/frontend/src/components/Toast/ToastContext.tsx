import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Toast, ToastProvider, ToastViewport } from "./Toast";

interface ToastData {
  id: string;
  title: string;
  open: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastData, "id" | "open">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastContextProvider");
  }
  return context;
}

interface ToastContextProviderProps {
  children: React.ReactNode;
}

export function ToastContextProvider({ children }: ToastContextProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, "id" | "open">) => {
    setToasts((prev) => {
      // Don't show another toast if one is already open
      if (prev.some((t) => t.open)) {
        return prev;
      }
      const id = Math.random().toString(36).substring(2, 9);
      return [...prev, { ...toast, id, open: true }];
    });
  }, []);

  const handleOpenChange = useCallback((id: string, open: boolean) => {
    if (!open) {
      // Set open to false to trigger close animation
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, open: false } : toast
        )
      );
      // Remove from DOM after animation completes (1s)
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 1000);
    }
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastProvider>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open={toast.open}
            onOpenChange={(open) => handleOpenChange(toast.id, open)}
            title={toast.title}
            action={toast.action}
            duration={toast.duration}
          />
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
