import { Semester } from "utils/playlists/semesters";
import { Schedule, serializeSchedule } from "utils/scheduler/scheduler";
import {
  DeleteScheduleMutationOptions,
  GetUserDocument,
  GetUserQuery,
  GetUserQueryVariables,
  ScheduleOverviewFragment,
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
} from "../graphql";
import { wrapMutation } from "./graphql";

/**
 * This will create a NEW schedule. Do not use this
 * to update a schedule.
 */
export const useCreateSchedule = wrapMutation(
  useCreateScheduleMutation,
  (schedule: Schedule, semester: Semester) => ({
    variables: serializeSchedule(schedule, semester),
    update(cache, { data }) {
      const existingUser = cache.readQuery<GetUserQuery, GetUserQueryVariables>(
        {
          query: GetUserDocument,
        }
      );

      if (existingUser?.user) {
        cache.writeQuery<GetUserQuery, GetUserQueryVariables>({
          query: GetUserDocument,
          data: {
            user: {
              ...existingUser.user,
              schedules: {
                edges: [
                  ...existingUser.user.schedules.edges,
                  {
                    __typename: "ScheduleTypeEdge",
                    node: data?.createSchedule?.schedule,
                  },
                ],
              },
            },
          },
        });
      }
    },
  })
);

/**
 * Use this hook to delete a schedule. You may pass
 * either the schedule GraphQL fragment or the
 * schedule id.
 */
export const useDeleteSchedule = wrapMutation(
  useDeleteScheduleMutation,
  (
    schedule: ScheduleOverviewFragment | string,
    options?: DeleteScheduleMutationOptions
  ) => {
    const scheduleId = typeof schedule === "string" ? schedule : schedule.id;

    return {
      ...options,
      variables: {
        id: scheduleId,
      },
      optimisticResponse: {
        removeSchedule: {
          schedule: {
            id: scheduleId,
          },
        },
      },
      update(cache) {
        const existingUser = cache.readQuery<
          GetUserQuery,
          GetUserQueryVariables
        >({
          query: GetUserDocument,
        });

        if (existingUser?.user) {
          cache.writeQuery<GetUserQuery, GetUserQueryVariables>({
            query: GetUserDocument,
            data: {
              user: {
                ...existingUser.user,
                schedules: {
                  edges: existingUser.user.schedules.edges.filter(
                    (edge) => edge?.node?.id !== scheduleId
                  ),
                },
              },
            },
          });
        }
      },
    };
  }
);
