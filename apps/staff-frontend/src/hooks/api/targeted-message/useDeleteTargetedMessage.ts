import { useMutation } from "@apollo/client";

import {
  ALL_TARGETED_MESSAGES_FOR_STAFF,
  DELETE_TARGETED_MESSAGE,
} from "../../../lib/api/targeted-message";

interface DeleteTargetedMessageResponse {
  deleteTargetedMessage: boolean;
}

export const useDeleteTargetedMessage = () => {
  const [mutate, result] = useMutation<DeleteTargetedMessageResponse>(
    DELETE_TARGETED_MESSAGE,
    {
      refetchQueries: [ALL_TARGETED_MESSAGES_FOR_STAFF],
    }
  );

  const deleteTargetedMessage = async (messageId: string) => {
    const response = await mutate({
      variables: { messageId },
    });
    return response.data?.deleteTargetedMessage;
  };

  return { deleteTargetedMessage, ...result };
};
