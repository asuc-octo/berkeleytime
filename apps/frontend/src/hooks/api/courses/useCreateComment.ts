import { useCallback } from "react";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  AddCourseCommentInput,
  CreateCommentDocument,
} from "@/lib/generated/graphql";

export const useCreateComment = () => {
  const mutation = useMutation(CreateCommentDocument, {
    update(cache, { data }) {
      const newComment = data?.addCourseComment;

      if (!newComment) return;

      const newCommentCourseId = newComment.courseId;
      const courseIdStr =
        typeof newCommentCourseId === "string"
          ? newCommentCourseId
          : JSON.stringify(newCommentCourseId);

      cache.modify({
        fields: {
          courseComments: (existingComments = [], { storeFieldName }) => {
            if (!storeFieldName.includes(courseIdStr)) {
              return existingComments;
            }

            const reference = cache.writeFragment({
              data: newComment,
              fragment: gql`
                fragment CreatedComment on CourseComment {
                  _id
                  courseId
                  author {
                    _id
                    name
                  }
                  content
                  createdAt
                }
              `,
            });

            return [...existingComments, reference];
          },
        },
      });
    },
  });

  const createComment = useCallback(
    async (input: AddCourseCommentInput) => {
      const mutate = mutation[0];

      return await mutate({ variables: { input } });
    },
    [mutation]
  );

  return [createComment, mutation[1]] as [
    mutate: typeof createComment,
    result: (typeof mutation)[1],
  ];
};
