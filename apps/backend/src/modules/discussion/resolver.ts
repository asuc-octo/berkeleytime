import { GraphQLError } from "graphql";

import {
  DiscussionRequestContext,
  createCourseComment,
  getCourseComments,
} from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    courseComments: async (
      _: unknown,
      {
        subject,
        courseNumber,
        createdBy,
      }: { subject: string; courseNumber: string; createdBy?: string | null }
    ) => {
      try {
        const normalizedSubject = subject.trim();
        const normalizedCourseNumber = courseNumber.trim();
        const normalizedCreatedBy = createdBy?.trim() || null;
        const comments = await getCourseComments(
          normalizedSubject,
          normalizedCourseNumber,
          normalizedCreatedBy
        );
        return comments as unknown as DiscussionModule.DiscussionComment[];
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
    createCourseComment: async (
      _: unknown,
      { input }: { input: DiscussionModule.CreateCourseCommentInput },
      context: DiscussionRequestContext
    ) => {
      try {
        const subject = input.subject.trim();
        const courseNumber = input.courseNumber.trim();
        const commentBody = input.comment.trim();
        const comment = await createCourseComment(
          context,
          subject,
          courseNumber,
          commentBody
        );
        return comment as unknown as DiscussionModule.DiscussionComment;
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

  DiscussionComment: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) => {
      const id = parent._id?.toString() ?? parent.id;
      if (!id) {
        throw new GraphQLError("Discussion comment id not found", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      return id;
    },
  },
};

export default resolvers;
