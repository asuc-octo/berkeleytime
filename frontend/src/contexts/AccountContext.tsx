import { createContext } from "react";

import { ApolloError } from "@apollo/client";

import { IAccount } from "@/lib/api";

interface AccountContextType {
  loading: boolean;
  error?: ApolloError;
  account: IAccount;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | null>(null);

export default AccountContext;
