import { useMutation } from "@apollo/client";

import {
  ALL_AD_TARGETS,
  AdTarget,
  UPDATE_AD_TARGET,
  UpdateAdTargetInput,
} from "../../../lib/api/ad-target";

interface UpdateAdTargetResponse {
  updateAdTarget: AdTarget;
}

export const useUpdateAdTarget = () => {
  const [mutate, result] = useMutation<UpdateAdTargetResponse>(
    UPDATE_AD_TARGET,
    {
      refetchQueries: [ALL_AD_TARGETS],
    }
  );

  const updateAdTarget = async (
    adTargetId: string,
    input: UpdateAdTargetInput
  ) => {
    const response = await mutate({
      variables: { adTargetId, input },
    });
    return response.data?.updateAdTarget;
  };

  return { updateAdTarget, ...result };
};
