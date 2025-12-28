import { useMutation } from "@apollo/client";

import { ALL_PODS, DELETE_POD } from "../../../lib/api/pod";

interface DeletePodResponse {
  deletePod: boolean;
}

export const useDeletePod = () => {
  const [mutate, result] = useMutation<DeletePodResponse>(DELETE_POD, {
    refetchQueries: [ALL_PODS],
  });

  const deletePod = async (podId: string) => {
    const response = await mutate({
      variables: { podId },
    });
    return response.data?.deletePod;
  };

  return { deletePod, ...result };
};
