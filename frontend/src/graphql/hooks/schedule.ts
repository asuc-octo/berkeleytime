import {
  BerkeleytimeUserType,
  DeleteScheduleMutationHookResult,
  DeleteScheduleMutationOptions,
  useDeleteScheduleMutation,
} from '../graphql';

const useDeleteSchedule = (
  options?: DeleteScheduleMutationOptions
): DeleteScheduleMutationHookResult =>
  useDeleteScheduleMutation({
    ...options,
    update(cache) {
      // cache.modify({
      //   fields: {
      //     user(existingUser: BerkeleytimeUserType, { readField }) {
      //       readF
      //     },
      //   },
      // });
    },
  });
