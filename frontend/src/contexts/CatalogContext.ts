import { createContext } from "react";

import { IClass, Semester } from "@/lib/api";

export interface CatalogContextType {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  partialClass: IClass | null;
}

const CatalogContext = createContext<CatalogContextType | null>(null);

export default CatalogContext;
