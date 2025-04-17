import { useContext } from "react";

import UserContext from "@/contexts/UserContext";

const useUser = () => {
  const userContext = useContext(UserContext);

  if (!userContext)
    throw new Error("useUser must be used within a UserContext");

  return userContext;
};

export default useUser;
