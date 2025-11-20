import { createContext } from "react";

import { IClass, IClassCourse } from "@/lib/api";

export interface ClassContextType {
  class: IClass;
  course: IClassCourse;
}

const ClassContext = createContext<ClassContextType | null>(null);

export default ClassContext;
