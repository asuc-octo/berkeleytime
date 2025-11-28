import { useEffect, useRef, useState } from "react";

import type { Option, OptionItem } from "./index";

/**
 * Deep equality comparison for objects by their key-value pairs
 * Used to compare option values that may be objects
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;

  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

/**
 * Type guard to check if an option is a selectable item (not a label)
 */
export const isOptionItem = <T>(option: Option<T>): option is OptionItem<T> => {
  return option.type !== "label";
};

/**
 * Hook to match dropdown width to trigger element width
 * Uses ResizeObserver to dynamically track width changes
 */
export function useMatchTriggerWidth<T extends HTMLElement>() {
  const triggerRef = useRef<T | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!triggerRef.current) return;

    const updateWidth = () => {
      if (triggerRef.current) {
        setWidth(triggerRef.current.offsetWidth);
      }
    };

    updateWidth(); // initial call
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(triggerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return { triggerRef, triggerWidth: width };
}
