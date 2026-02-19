import { useCallback } from "react";

import { MutationHookOptions, useMutation } from "@apollo/client/react";

import {
  SelectedCourseInput,
  SetSelectedCoursesDocument,
  SetSelectedCoursesMutation,
  SetSelectedCoursesMutationVariables,
} from "@/lib/generated/graphql";

export const useSetSelectedCourses = () => {
  const mutation = useMutation<
    SetSelectedCoursesMutation,
    SetSelectedCoursesMutationVariables
  >(
    SetSelectedCoursesDocument,
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
        MutationHookOptions<
          SetSelectedCoursesMutation,
          SetSelectedCoursesMutationVariables
        >,
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
