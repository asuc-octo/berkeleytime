import { useContext } from "react";

import PinsContext from "@/contexts/PinsContext";

const usePins = () => {
  const pinsContext = useContext(PinsContext);

  if (!pinsContext) {
    throw new Error("usePins must be used within a PinsProvider");
  }

  return pinsContext;
};

export default usePins;
