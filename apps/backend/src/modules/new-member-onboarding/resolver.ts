import { GraphQLError } from "graphql";

import {
  RequestContext,
  addCourseComment,
  getCourseComments,
} from "./controller";
import { formatCourseComment } from "./formatter";
import { NewMemberOnboardingModule } from "./generated-types/module-types";

const resolvers: NewMemberOnboardingModule.Resolvers = {
  Query: {
    courseComments: async (_, { subject, courseNumber, userId }) => {
      try {
        const comments = await getCourseComments(
          subject,
          courseNumber,
          userId !== null && userId !== undefined ? userId : undefined
        );
        return comments.map(formatCourseComment);
      } catch (error: unknown) {
        // Re-throw GraphQLErrors as is
        if (error instanceof GraphQLError) {
          throw error;
        }
        // Convert any other errors to GraphQLError
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
      _: unknown,
      {
        input,
      }: { input: { subject: string; courseNumber: string; text: string } },
      context: RequestContext
    ) => {
      try {
        const comment = await addCourseComment(
          context,
          input.subject,
          input.courseNumber,
          input.text
        );
        return formatCourseComment(comment);
      } catch (error: unknown) {
        // Re-throw GraphQLErrors as is
        if (error instanceof GraphQLError) {
          throw error;
        }
        // Convert any other errors to GraphQLError
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
