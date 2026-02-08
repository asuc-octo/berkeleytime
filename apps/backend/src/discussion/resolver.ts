import { GraphQLError } from "graphql";

import { addCourseComment, getCourseComments } from "./controller";

interface CourseCommentsArgs {
  subject: string;
  courseNumber: string;
  userId?: string | null;
}

interface AddCourseCommentArgs {
  subject: string;
  courseNumber: string;
  content: string;
}

const resolvers = {
  Query: {
    courseComments: async (
      _: unknown,
      { subject, courseNumber, userId }: CourseCommentsArgs
    ) => {
      try {
        const comments = await getCourseComments(
          subject,
          courseNumber,
          userId ?? null
        );
        return comments;
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
      _: unknown,
      { subject, courseNumber, content }: AddCourseCommentArgs,
      context: { user?: { _id: string } }
    ) => {
      try {
        const comment = await addCourseComment(
          context,
          subject,
          courseNumber,
          content
        );
        return comment;
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
