import { Dispatch, createContext } from "react";

import { Semester } from "@/lib/api";

interface BasePin {
  id: string;
}

export interface ClassPin extends BasePin {
  type: "class";
  data: {
    year: number;
    semester: Semester;
    subject: string;
    courseNumber: string;
    number: string;
  };
}

export interface CoursePin extends BasePin {
  type: "course";
  data: {
    subject: string;
    number: string;
  };
}

export type Pin = ClassPin | CoursePin;

export type PinEvent = "mouseenter" | "mouseleave" | "click";

export type PinEventListener = (event: PinEvent, pin: Pin) => void;

export interface PinsContextType {
  pins: Pin[];
  addPin: (pin: Pin) => void;
  removePin: (pin: Pin) => void;
  pinEventListeners: PinEventListener[];
  addPinEventListener: Dispatch<PinEventListener>;
  removePinEventListener: Dispatch<PinEventListener>;
  clearPins: () => void;
}

const PinsContext = createContext<PinsContextType | null>(null);

export default PinsContext;
