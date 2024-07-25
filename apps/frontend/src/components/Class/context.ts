import { createContext } from "react";

import { IClass, Semester } from "@/lib/api";

export interface ClassContextType {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  partialClass?: IClass | null;
  dialog?: boolean;
}

const ClassContext = createContext<ClassContextType | null>(null);

export default ClassContext;
