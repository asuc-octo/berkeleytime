import { createContext } from "react";

import { IClassCourse, IClassDetails } from "@/lib/api";

export interface ClassContextType {
  class: IClassDetails;
  course: IClassCourse;
  openRatingsTab?: () => void;
}

const ClassContext = createContext<ClassContextType | null>(null);

export default ClassContext;
