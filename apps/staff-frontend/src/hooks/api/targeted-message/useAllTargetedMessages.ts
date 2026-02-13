import { useQuery } from "@apollo/client";

import {
  ALL_TARGETED_MESSAGES_FOR_STAFF,
  TargetedMessage,
} from "../../../lib/api/targeted-message";

interface AllTargetedMessagesForStaffResponse {
  allTargetedMessagesForStaff: TargetedMessage[];
}

export const useAllTargetedMessages = () => {
  const query = useQuery<AllTargetedMessagesForStaffResponse>(
    ALL_TARGETED_MESSAGES_FOR_STAFF
  );

  return {
    ...query,
    data: query.data?.allTargetedMessagesForStaff ?? [],
  };
};
