import { addComment, getComments } from "./controller";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    comments: async (
      _: any,
      args: { courseNumber: string; createdBy?: string | null }
    ) => {
      const comments = await getComments(
        args.courseNumber,
        args.createdBy ?? ""
      );
      return comments as unknown as DiscussionModule.Comment[];
    },
  },

  Mutation: {
    addComment: async (
      _: any,
      args: { input: { courseNumber: string; text: string; createdBy: string } }
    ) => {
      const { courseNumber, text, createdBy } = args.input;
      const userId = createdBy;
      const comment = await addComment(courseNumber, text, userId);
      return comment as unknown as DiscussionModule.Comment;
    },
  },
};

export default resolvers;
