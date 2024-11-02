import { createContext } from "react";

import { IClass } from "@/lib/api";

export interface ClassContextType {
  class: IClass;
}

const ClassContext = createContext<ClassContextType | null>(null);

export default ClassContext;
