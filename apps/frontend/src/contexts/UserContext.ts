import { createContext } from "react";

import { IUser } from "@/lib/api";

export interface UserContextType {
  user: IUser | undefined;
  loading: boolean;
  error?: Error;
}

const UserContext = createContext<UserContextType | null>(null);

export default UserContext;
