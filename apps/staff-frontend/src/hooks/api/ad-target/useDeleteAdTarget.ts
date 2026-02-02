import { useMutation } from "@apollo/client";

import { ALL_AD_TARGETS, DELETE_AD_TARGET } from "../../../lib/api/ad-target";

interface DeleteAdTargetResponse {
  deleteAdTarget: boolean;
}

export const useDeleteAdTarget = () => {
  const [mutate, result] = useMutation<DeleteAdTargetResponse>(
    DELETE_AD_TARGET,
    {
      refetchQueries: [ALL_AD_TARGETS],
    }
  );

  const deleteAdTarget = async (adTargetId: string) => {
    const response = await mutate({
      variables: { adTargetId },
    });
    return response.data?.deleteAdTarget;
  };

  return { deleteAdTarget, ...result };
};
