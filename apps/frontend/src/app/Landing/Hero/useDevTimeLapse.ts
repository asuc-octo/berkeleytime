import { useCallback, useEffect, useState } from "react";

interface UseDevTimeLapseOptions {
  /** Enable the dev time-lapse feature (default: true in dev, false in prod) */
  enabled?: boolean;
  /** Key to toggle time-lapse mode (default: 't') */
  toggleKey?: string;
  /** Minutes to advance per tick in fast mode (default: 2) */
  minutesPerTick?: number;
  /** Milliseconds between ticks in fast mode (default: 100) */
  tickInterval?: number;
}

interface UseDevTimeLapseResult {
  /** Current milliseconds timestamp to use for rendering */
  milliseconds: number;
  /** Whether time-lapse mode is active */
  isTimeLapsing: boolean;
}

/**
 * Hook that provides a time value for sky/tower rendering.
 * In normal mode, returns real time updated every second.
 * Press the toggle key to enable time-lapse mode which cycles through a day smoothly.
 */
export function useDevTimeLapse(
  options: UseDevTimeLapseOptions = {}
): UseDevTimeLapseResult {
  const {
    enabled = import.meta.env.DEV,
    toggleKey = "t",
    minutesPerTick = 2,
    tickInterval = 100,
  } = options;

  const [milliseconds, setMilliseconds] = useState(() => Date.now());
  const [isTimeLapsing, setIsTimeLapsing] = useState(false);

  // Toggle handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (e.key.toLowerCase() === toggleKey.toLowerCase()) {
        setIsTimeLapsing((prev) => {
          const next = !prev;
          // Reset to current time when toggling off
          if (!next) setMilliseconds(Date.now());
          return next;
        });
      }
    },
    [enabled, toggleKey]
  );

  // Key listener
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);

  // Time update loop
  useEffect(() => {
    if (isTimeLapsing) {
      // Time-lapse mode: cycle through a single day smoothly
      const baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);
      const baseMidnight = baseDate.getTime();
      const msPerDay = 24 * 60 * 60 * 1000;
      const incrementMs = minutesPerTick * 60 * 1000;

      const interval = setInterval(() => {
        setMilliseconds((ms) => {
          const timeOfDay = (ms - baseMidnight + msPerDay) % msPerDay;
          const newTimeOfDay = (timeOfDay + incrementMs) % msPerDay;
          return baseMidnight + newTimeOfDay;
        });
      }, tickInterval);

      return () => clearInterval(interval);
    } else {
      // Normal mode: real time, update every second
      const interval = setInterval(() => {
        setMilliseconds((ms) => ms + 1000);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTimeLapsing, minutesPerTick, tickInterval]);

  return { milliseconds, isTimeLapsing };
}
