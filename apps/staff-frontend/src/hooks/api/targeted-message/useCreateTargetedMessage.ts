import { useMutation } from "@apollo/client";

import {
  ALL_TARGETED_MESSAGES_FOR_STAFF,
  CREATE_TARGETED_MESSAGE,
  CreateTargetedMessageInput,
  TargetedMessage,
} from "../../../lib/api/targeted-message";

interface CreateTargetedMessageResponse {
  createTargetedMessage: TargetedMessage;
}

export const useCreateTargetedMessage = () => {
  const [mutate, result] = useMutation<CreateTargetedMessageResponse>(
    CREATE_TARGETED_MESSAGE,
    {
      refetchQueries: [ALL_TARGETED_MESSAGES_FOR_STAFF],
    }
  );

  const createTargetedMessage = async (input: CreateTargetedMessageInput) => {
    const response = await mutate({
      variables: { input },
    });
    return response.data?.createTargetedMessage;
  };

  return { createTargetedMessage, ...result };
};
