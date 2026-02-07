import {
  DiscussionRequestContext,
  addCourseComment,
  getCourseComments,
} from "./controller";
import { formatComment } from "./formatter";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  Query: {
    courseComments: async (_, { courseId, userId }) => {
      const comments = await getCourseComments(courseId, userId ?? undefined);
      return comments.map((comment) => formatComment(comment));
    },
  },
  Mutation: {
    addCourseComment: async (
      _,
      { courseId, body },
      context: DiscussionRequestContext
    ) => {
      const comment = await addCourseComment(context, courseId, body);
      return formatComment(comment);
    },
  },
};

export default resolvers;
