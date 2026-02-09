import { getUserById } from "../user/controller";
import { addCourseComment, getCourseComments } from "./controller";
import { IntermediateCourseComment } from "./formatter";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    courseComments: async (_, { courseId }) => {
      return getCourseComments(courseId);
    },
  },

  Mutation: {
    addCourseComment: async (_, { input }, context) => {
      return addCourseComment(
        context,
        input.courseId,
        input.content
      );
    },
  },

  CourseComment: {
    author: async (parent: IntermediateCourseComment) => {
      const user = await getUserById(parent.author);

      if (!user) {
        throw new Error("Author not found");
      }

      return user;
    },
  },
};

export default resolvers;
