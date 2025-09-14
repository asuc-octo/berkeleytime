import { DiscussionModule } from "./generated-types/module-types";
import { getDiscussion, createComment } from "./controller";

const resolvers: any = {
  Query: {
    discussions: async (_: any, args: { courseSubject: string, courseNumber: string }) => {
      const { courseSubject, courseNumber } = args;
      const discussion = await getDiscussion(courseSubject, courseNumber);

      if (!discussion) return [] as unknown as DiscussionModule.Comment[];
      return discussion.comments as unknown as DiscussionModule.Comment[];
    },
  },

  Mutation: {
    createComment: async (_: any, args: { courseSubject: string, courseNumber:string , userId: string, comment: string, timestamp: string }) => {
      const { courseSubject, courseNumber, userId, comment, timestamp } = args;
      const discussion = await createComment(courseSubject, courseNumber, userId, comment, timestamp);
      
      if (!discussion) return [] as unknown as DiscussionModule.Comment[];
      return discussion.comments as unknown as DiscussionModule.Comment[];
    },
  }
}

export default resolvers;