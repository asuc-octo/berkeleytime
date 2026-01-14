import { useMutation } from "@apollo/client";

import {
  ALL_PODS,
  CREATE_POD,
  CreatePodInput,
  Pod,
} from "../../../lib/api/pod";

interface CreatePodResponse {
  createPod: Pod;
}

export const useCreatePod = () => {
  const [mutate, result] = useMutation<CreatePodResponse>(CREATE_POD, {
    refetchQueries: [ALL_PODS],
  });

  const createPod = async (input: CreatePodInput) => {
    const response = await mutate({
      variables: { input },
    });
    return response.data?.createPod;
  };

  return { createPod, ...result };
};
