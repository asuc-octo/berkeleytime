import { useCallback } from "react";

import { useMutation, useQuery } from "@apollo/client/react";

import {
  CreateCourseCommentDocument,
  CreateCourseCommentMutation,
  CreateCourseCommentMutationVariables,
  GetCourseCommentsDocument,
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
  >(GetCourseCommentsDocument, {
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
  >(CreateCourseCommentDocument);

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
            query: GetCourseCommentsDocument,
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
