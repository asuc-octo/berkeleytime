import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import "@/lib/api/targeted-message";
import { IncrementTargetedMessageDismissDocument } from "@/lib/generated/graphql";

export const useIncrementTargetedMessageDismiss = () => {
  const [mutate] = useMutation(IncrementTargetedMessageDismissDocument);

  const incrementDismiss = useCallback(
    (messageId: string) => mutate({ variables: { messageId } }),
    [mutate]
  );

  return { incrementDismiss };
};
