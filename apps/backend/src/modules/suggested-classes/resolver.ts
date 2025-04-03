import { SuggestedClassesModule } from "./generated-types/module-types";
import { getPosts, addPost } from "./controller";
import { MutationAddPostArgs, QueryGetAllPostsArgs } from "../../generated-types/graphql";

export const resolvers: SuggestedClassesModule.Resolvers = {
  Query: {
    getAllPosts: async (_parent, _args: QueryGetAllPostsArgs, context) => {
      try {
        return await getPosts(context);
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error("Failed to fetch posts");
      }
    }
  },
  Mutation: {
    addPost: async (_parent, { number, courseNumber, image, semester, sessionId, subject, text, year }: MutationAddPostArgs, context) => {
      try {
        // Make sure all required fields are explicitly passed to maintain correct typing
        return await addPost(context, {
          number,
          courseNumber,
          image,
          semester,
          sessionId,
          subject,
          text,
          year
        });
      } catch (error) {
        console.error("Error creating post:", error);
        throw new Error("Failed to create post");
      }
    }
  },
  Post: {
    __isTypeOf: (obj) => obj.hasOwnProperty('semester') && obj.hasOwnProperty('courseNumber')
  },
  JulianaInfo: {
    __isTypeOf: (obj) => obj.hasOwnProperty('image') && obj.hasOwnProperty('text')
  }
};

export default resolvers;