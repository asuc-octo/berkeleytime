import { useContext } from "react";

import BrowserContext from "./browserContext";

const useBrowser = () => {
  const context = useContext(BrowserContext);

  if (!context)
    throw new Error("useBrowser must be used within a BrowserProvider");

  return context;
};

export default useBrowser;
