import { useMutation } from "@apollo/client";

import {
  ALL_TARGETED_MESSAGES_FOR_STAFF,
  TargetedMessage,
  UPDATE_TARGETED_MESSAGE,
  UpdateTargetedMessageInput,
} from "../../../lib/api/targeted-message";

interface UpdateTargetedMessageResponse {
  updateTargetedMessage: TargetedMessage;
}

export const useUpdateTargetedMessage = () => {
  const [mutate, result] = useMutation<UpdateTargetedMessageResponse>(
    UPDATE_TARGETED_MESSAGE,
    {
      refetchQueries: [ALL_TARGETED_MESSAGES_FOR_STAFF],
    }
  );

  const updateTargetedMessage = async (
    messageId: string,
    input: UpdateTargetedMessageInput
  ) => {
    const response = await mutate({
      variables: { messageId, input },
    });
    return response.data?.updateTargetedMessage;
  };

  return { updateTargetedMessage, ...result };
};
