import { ReactNode, useEffect, useState } from "react";

import PinsContext, { Pin, PinEventListener } from "@/contexts/PinsContext";

const key = "pins";

const getPins = () => {
  const value = localStorage.getItem(key);

  if (!value) return [];

  try {
    return JSON.parse(value) as Pin[];
  } catch {
    localStorage.removeItem(key);

    return [];
  }
};

interface PinsProviderProps {
  children: ReactNode;
}

export default function PinsProvider({ children }: PinsProviderProps) {
  const [pins, setPins] = useState<Pin[]>(() => getPins());

  const [pinEventListeners, setPinEventListeners] = useState<
    PinEventListener[]
  >([]);

  useEffect(() => {
    // Listen for changes in other tabs
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return;

      setPins(getPins());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addPinEventListener = (listener: PinEventListener) => {
    setPinEventListeners((listeners) => [...listeners, listener]);
  };

  const removePinEventListener = (listener: PinEventListener) => {
    setPinEventListeners((listeners) =>
      listeners.filter((l) => l !== listener)
    );
  };

  const addPin = (pin: Pin) => {
    // Prevent duplicates
    if (pins.some((existingPin) => existingPin.id === pin.id)) return;

    updatePins([...pins, pin]);
  };

  const removePin = (pin: Pin) => {
    updatePins(pins.filter((existingPin) => existingPin.id !== pin.id));
  };

  const updatePins = (pins: Pin[]) => {
    setPins(pins);

    const value = JSON.stringify(pins);
    localStorage.setItem(key, value);
  };

  return (
    <PinsContext
      value={{
        pins,
        addPin,
        removePin,
        pinEventListeners,
        addPinEventListener,
        removePinEventListener,
      }}
    >
      {children}
    </PinsContext>
  );
}
