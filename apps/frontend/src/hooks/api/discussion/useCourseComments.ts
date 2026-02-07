import { useCallback } from "react";

import { useMutation, useQuery } from "@apollo/client/react";

import {
  CREATE_COURSE_COMMENT,
  GET_COURSE_COMMENTS,
} from "@/lib/api/discussion";
import {
  CreateCourseCommentMutation,
  CreateCourseCommentMutationVariables,
  GetCourseCommentsQuery,
  GetCourseCommentsQueryVariables,
} from "@/lib/generated/graphql";

export const useCourseComments = (
  subject: string,
  courseNumber: string,
  createdBy?: string | null
) => {
  const query = useQuery<
    GetCourseCommentsQuery,
    GetCourseCommentsQueryVariables
  >(GET_COURSE_COMMENTS, {
    variables: {
      subject,
      courseNumber,
      createdBy: createdBy ?? null,
    },
    skip: !subject || !courseNumber,
    fetchPolicy: "cache-and-network",
  });

  const [createComment, createState] = useMutation<
    CreateCourseCommentMutation,
    CreateCourseCommentMutationVariables
  >(CREATE_COURSE_COMMENT);

  const submitComment = useCallback(
    async (comment: string) => {
      if (!comment.trim()) return;
      await createComment({
        variables: {
          input: {
            subject,
            courseNumber,
            comment,
          },
        },
        refetchQueries: [
          {
            query: GET_COURSE_COMMENTS,
            variables: {
              subject,
              courseNumber,
              createdBy: createdBy ?? null,
            },
          },
        ],
        awaitRefetchQueries: true,
      });
    },
    [createComment, subject, courseNumber, createdBy]
  );

  return {
    comments: query.data?.courseComments ?? [],
    loading: query.loading,
    error: query.error,
    submitComment,
    submitting: createState.loading,
  };
};
