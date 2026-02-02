import { useMutation } from "@apollo/client";

import {
  ALL_AD_TARGETS,
  AdTarget,
  CREATE_AD_TARGET,
  CreateAdTargetInput,
} from "../../../lib/api/ad-target";

interface CreateAdTargetResponse {
  createAdTarget: AdTarget;
}

export const useCreateAdTarget = () => {
  const [mutate, result] = useMutation<CreateAdTargetResponse>(
    CREATE_AD_TARGET,
    {
      refetchQueries: [ALL_AD_TARGETS],
    }
  );

  const createAdTarget = async (input: CreateAdTargetInput) => {
    const response = await mutate({
      variables: { input },
    });
    return response.data?.createAdTarget;
  };

  return { createAdTarget, ...result };
};
