import { createContext } from "react";

import { IClass, ICourse } from "@/lib/api";

export interface ClassContextType {
  class: IClass;
  course: ICourse;
}

const ClassContext = createContext<ClassContextType | null>(null);

export default ClassContext;
