import {getCommentsForCourse, addCommentToCourse} from "./controller";

export const resolvers = {
    Query: {
        commentsByCourse: async (_: any, args: { courseId: string; userId?: string }) => {
            return getCommentsForCourse({ courseId: args.courseId, userId: args.userId });
        },
    },


    Mutation: {
        addComment: async (_: any, args: { courseId: string; userId: string; text: string }) => {
            return addCommentToCourse({ courseId: args.courseId, userId: args.userId, text: args.text });
        }
    }
}

export default resolvers;