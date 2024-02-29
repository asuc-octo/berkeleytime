import { useContext } from "react";

import AccountContext from "@/contexts/AccountContext";

export const useAccount = () => {
  const accountContext = useContext(AccountContext);

  if (!accountContext)
    throw new Error("useAccount has to be used within AccountProvider");

  return accountContext;
};
