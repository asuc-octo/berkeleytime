import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import { DELETE_ACCOUNT } from "@/lib/api";

interface DeleteAccountResponse {
  deleteAccount: boolean;
}

export const useDeleteAccount = () => {
  const mutation = useMutation<DeleteAccountResponse>(DELETE_ACCOUNT);

  const deleteAccount = useCallback(async () => {
    const mutate = mutation[0];
    return await mutate();
  }, [mutation]);

  return [deleteAccount, mutation[1]] as [
    mutate: typeof deleteAccount,
    result: (typeof mutation)[1],
  ];
};
