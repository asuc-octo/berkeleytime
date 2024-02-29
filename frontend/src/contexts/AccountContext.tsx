import { createContext } from "react";

interface AccountContextType {}

const AccountContext = createContext<AccountContextType | null>(null);

export default AccountContext;
