import { useContext } from "react";

import CoursePageContext from "@/contexts/CourseContext";

const useCourse = () => {
  const courseContext = useContext(CoursePageContext);

  if (!courseContext) {
    throw new Error("useCourse must be used within a CourseContext");
  }

  return courseContext;
};

export default useCourse;
