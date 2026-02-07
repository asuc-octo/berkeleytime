import { GraphQLError } from "graphql";

import type { Semester } from "../../generated-types/graphql";
import type { RequestContext } from "../../types/request-context";
import {
  createComment as createCommentController,
  deleteComment as deleteCommentController,
  getCommentsForClass,
} from "./controller";
import { formatClassComments, formatComment } from "./formatter";

interface CommentsForClassArgs {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
}

interface CreateCommentArgs {
  input: {
    body: string;
    year: number;
    semester: Semester;
    subject: string;
    courseNumber: string;
    classNumber: string;
    parentId?: string | null;
  };
}

interface DeleteCommentArgs {
  id: string;
}

const resolvers = {
  Query: {
    commentsForClass: async (
      _: unknown,
      {
        year,
        semester,
        subject,
        courseNumber,
        classNumber,
      }: CommentsForClassArgs
    ) => {
      try {
        const docs = await getCommentsForClass(
          year,
          semester,
          subject,
          courseNumber,
          classNumber
        );
        return formatClassComments(
          docs,
          year,
          semester,
          subject,
          courseNumber,
          classNumber
        );
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String((error as Error).message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },
  },
  Mutation: {
    createComment: async (
      _: unknown,
      { input }: CreateCommentArgs,
      context: RequestContext
    ) => {
      try {
        const doc = await createCommentController(context, {
          body: input.body,
          year: input.year,
          semester: input.semester,
          subject: input.subject,
          courseNumber: input.courseNumber,
          classNumber: input.classNumber,
          parentId: input.parentId ?? undefined,
        });
        return formatComment(doc);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String((error as Error).message)
            : "An unexpected error occurred",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },
    deleteComment: async (
      _: unknown,
      { id }: DeleteCommentArgs,
      context: RequestContext
    ) => {
      try {
        return await deleteCommentController(context, id);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String((error as Error).message)
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
