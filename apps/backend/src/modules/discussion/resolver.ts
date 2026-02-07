import {
  addCourseComment,
  getCourseComments,
} from "./controller";
import { getUserById } from "../user/controller";
import { DiscussionModule } from "./generated-types/module-types";
import { IntermediateCourseComment } from "./formatter";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    courseComments: async (_, { courseId }) => {
      const comments = await getCourseComments(courseId);

      return comments as unknown as DiscussionModule.CourseComment[];
    },
  },

  Mutation: {
    addCourseComment: async (_, { input }, context) => {
      const comment = await addCourseComment(
        context,
        input.courseId,
        input.content
      );

      return comment as unknown as DiscussionModule.CourseComment;
    },
  },

  CourseComment: {
    author: async (parent) => {
      // Parent is intermediate format from controller (author is user ID string)
      const authorId = (parent as unknown as IntermediateCourseComment).author;
      const user = await getUserById(authorId);

      if (!user) {
        throw new Error("Author not found");
      }

      return user as unknown as DiscussionModule.User;
    },
  },
};

export default resolvers;
