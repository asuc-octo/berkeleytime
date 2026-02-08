import { useMutation } from "@apollo/client/react";

import {
  AddCourseCommentDocument,
  GetCourseCommentsDocument,
} from "@/lib/generated/graphql";

export const useAddCourseComment = (subject: string, courseNumber: string) => {
  const [addComment, result] = useMutation(AddCourseCommentDocument, {
    refetchQueries: [
      {
        query: GetCourseCommentsDocument,
        variables: { subject, courseNumber },
      },
    ],
  });
  return [addComment, result] as const;
};
