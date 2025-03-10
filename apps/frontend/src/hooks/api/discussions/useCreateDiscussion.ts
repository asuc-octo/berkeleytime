import { MutationHookOptions, useMutation } from "@apollo/client";

import { ADD_DISCUSSION, IDiscussion } from "@/lib/api";

export const useCreateDiscussion = (
  options?: Omit<
    MutationHookOptions<
      { addDiscussion: IDiscussion },
      { courseId: string; text: string; userId: string }
    >,
    "variables"
  >
) => {
  const [mutate, { data, loading, error }] = useMutation<
    { addDiscussion: IDiscussion },
    { courseId: string; text: string; userId: string }
  >(ADD_DISCUSSION, options);

  const addDiscussion = (courseId: string, text: string, userId: string) => {
    mutate({
      variables: { courseId, text, userId },
    });
  };

  return {
    addDiscussion,
    data,
    loading,
    error,
  };
};
