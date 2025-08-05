import { createContext } from "react";

import { IUser } from "@/lib/api";

export interface UserContextType {
  user: IUser;
}

const UserContext = createContext<UserContextType | null>(null);

export default UserContext;
