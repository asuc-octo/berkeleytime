import { useMutation } from "@apollo/client/react";

import {
  AddCourseDiscussionDocument,
  GetCourseDiscussionsDocument,
} from "@/lib/generated/graphql";

export const useAddCourseDiscussion = (courseId: string) => {
  const [addCourseDiscussion, result] = useMutation(
    AddCourseDiscussionDocument,
    {
      refetchQueries: [
        {
          query: GetCourseDiscussionsDocument,
          variables: { courseId },
        },
      ],
      awaitRefetchQueries: true,
    }
  );

  const submitComment = (comment: string) =>
    addCourseDiscussion({
      variables: { courseId, comment },
    });

  return [submitComment, result] as const;
};
