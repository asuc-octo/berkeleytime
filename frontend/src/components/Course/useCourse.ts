import { useContext } from "react";

import CourseContext from "./context";

const useCourse = () => {
  const courseContext = useContext(CourseContext);

  if (!courseContext)
    throw new Error("useCourse must be used within a CourseContext.Provider");

  return courseContext;
};

export default useCourse;
