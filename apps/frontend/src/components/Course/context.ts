import { createContext } from "react";

import { ICourse } from "@/lib/api";

export interface CourseContextType {
  subject: string;
  number: string;
  partialCourse?: ICourse | null;
  dialog?: boolean;
}

const CourseContext = createContext<CourseContextType | null>(null);

export default CourseContext;
