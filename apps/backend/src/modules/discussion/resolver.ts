import { GraphQLError } from "graphql";

import { addCourseComment, getCourseComments } from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    courseComments: async (_, { courseId, userId }) => {
      try {
        const comments = await getCourseComments(courseId, userId ?? undefined);
        return comments as unknown as DiscussionModule.DiscussionComment[];
      } catch (error: unknown) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String((error as Error).message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },
  },
  Mutation: {
    addCourseComment: async (_, { courseId, body }, context) => {
      try {
        const comment = await addCourseComment(context, courseId, body);
        return comment as unknown as DiscussionModule.DiscussionComment;
      } catch (error: unknown) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String((error as Error).message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },
  },
};

export default resolvers;
