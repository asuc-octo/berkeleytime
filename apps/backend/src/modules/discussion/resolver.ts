import {
  CreateCourseCommentInput,
  DiscussionRequestContext,
  createCourseComment,
  getCourseComments,
} from "./controller";

const resolvers = {
  Query: {
    courseComments: (
      _: unknown,
      {
        subject,
        courseNumber,
        createdBy,
      }: { subject: string; courseNumber: string; createdBy?: string | null }
    ) => getCourseComments(subject, courseNumber, createdBy),
  },

  Mutation: {
    createCourseComment: (
      _: unknown,
      { input }: { input: CreateCourseCommentInput },
      context: DiscussionRequestContext
    ) => createCourseComment(context, input),
  },

  DiscussionComment: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
