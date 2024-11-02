import { createContext } from "react";

import { ICourse } from "@/lib/api";

export interface CourseContextType {
  course: ICourse;
}

const CourseContext = createContext<CourseContextType | null>(null);

export default CourseContext;
