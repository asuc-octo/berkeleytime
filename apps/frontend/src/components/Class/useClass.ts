import { useContext } from "react";

import ClassContext from "./context";

const useClass = () => {
  const classContext = useContext(ClassContext);

  if (!classContext)
    throw new Error("useClass must be used within a ClassContext.Provider");

  return classContext;
};

export default useClass;
