import { useEffect, useRef } from "react";

/**
 * Calls `onAdd` when Enter is pressed, as long as `enabled` is true
 * and the focus is not inside a text input or textarea.
 */
export default function useEnterToAdd(onAdd: () => void, enabled: boolean) {
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (!enabled) return;

      e.preventDefault();
      onAddRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
