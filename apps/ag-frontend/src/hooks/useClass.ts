import { useContext } from "react";

import ClassContext from "@/contexts/ClassContext";

const useClass = () => {
  const classContext = useContext(ClassContext);

  if (!classContext)
    throw new Error("useClass must be used within a ClassContext");

  return classContext;
};

export default useClass;
