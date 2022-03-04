import {
  CourseOverviewFragment,
  useSaveCourseMutation,
  useUnsaveCourseMutation,
} from "../../graphql/graphql";
import { useCallback } from "react";
import { useUser } from "./user";

/**
 * Saves a course optimistically
 */
export const useSaveCourse = () => {
  const { user } = useUser();
  const [saveCourse] = useSaveCourseMutation();
  return useCallback(
    (course: CourseOverviewFragment) =>
      saveCourse({
        variables: { courseId: course.id },
        optimisticResponse: {
          __typename: "Mutation",
          saveClass: user && {
            __typename: "SaveClass",
            user: {
              __typename: "BerkeleytimeUserType",
              id: user.id,
              savedClasses: (user.savedClasses || [])
                .filter((c) => c?.id !== course.id)
                .concat([course]),
            },
          },
        },
      }),
    [user, saveCourse]
  );
};

/**
 * Unsaves a course optimistically
 */
export const useUnsaveCourse = () => {
  const { user } = useUser();
  const [unsaveCourse] = useUnsaveCourseMutation();
  return useCallback(
    (course: CourseOverviewFragment) =>
      unsaveCourse({
        variables: { courseId: course.id },
        optimisticResponse: {
          __typename: "Mutation",
          removeClass: user && {
            __typename: "RemoveClass",
            user: {
              __typename: "BerkeleytimeUserType",
              id: user.id,
              savedClasses: (user.savedClasses || []).filter(
                (c) => c?.id !== course.id
              ),
            },
          },
        },
      }),
    [user, unsaveCourse]
  );
};
