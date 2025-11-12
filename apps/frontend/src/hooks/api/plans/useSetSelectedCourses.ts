import { useCallback } from "react";

import { MutationHookOptions, useMutation } from "@apollo/client/react";

import {
  SET_SELECTED_COURSES,
  SelectedCourseInput,
  SetSelectedCoursesResponse,
} from "@/lib/api";

export const useSetSelectedCourses = () => {
  const mutation = useMutation<SetSelectedCoursesResponse>(
    SET_SELECTED_COURSES,
    {
      update(cache, { data }, { variables }) {
        const selectedCourses = data?.setSelectedCourses;

        if (!selectedCourses || !variables) return;

        cache.modify({
          id: cache.identify({ __typename: "PlanTerm", _id: variables.id }),
          fields: {
            courses: () => variables.courses,
          },
        });
      },
    }
  );

  const updateSchedule = useCallback(
    async (
      id: string,
      courses: SelectedCourseInput[],
      options?: Omit<
        MutationHookOptions<SetSelectedCoursesResponse>,
        "variables"
      >
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { id, courses },
      });
    },
    [mutation]
  );

  return [updateSchedule, mutation[1]] as [
    mutate: typeof updateSchedule,
    result: (typeof mutation)[1],
  ];
};
