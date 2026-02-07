import { GraphQLError } from "graphql";

import {
  DiscussionRequestContext,
  addCourseComment,
  getCourseComments,
} from "./controller";
import { formatComment } from "./formatter";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    courseComments: async (_, { courseId, userId }) => {
      try {
        const comments = await getCourseComments(courseId, userId ?? undefined);
        return comments.map((comment) =>
          formatComment({
            ...comment,
            _id: comment._id ?? undefined,
          })
        );
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },
  },
  Mutation: {
    addCourseComment: async (
      _,
      { courseId, body },
      context: DiscussionRequestContext
    ) => {
      try {
        const comment = await addCourseComment(context, courseId, body);
        return formatComment({
          ...comment,
          _id: comment._id ?? undefined,
        });
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },
  },
};

export default resolvers;
