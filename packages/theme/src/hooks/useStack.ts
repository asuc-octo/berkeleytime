import { useContext } from "react";

import { StackContext } from "../contexts/StackContext";

export const useStack = () => {
  return useContext(StackContext);
};
