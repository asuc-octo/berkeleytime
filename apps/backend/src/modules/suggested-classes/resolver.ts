import { getClass } from "../class/controller";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "./controller";
import { IntermediatePost } from "./formatter";
import { SuggestedClassesModule } from "./generated-types/module-types";

const resolvers: SuggestedClassesModule.Resolvers = {
  Query: {
    posts: async () => {
      const posts = await getPosts();
      return posts as unknown as SuggestedClassesModule.Post[];
    },
    post: async (_, { id }) => {
      const post = await getPost(id);
      return post as unknown as SuggestedClassesModule.Post;
    },
  },

  Post: {
    class: async (parent: SuggestedClassesModule.Post | IntermediatePost) => {
      if (parent.class && (parent.class as SuggestedClassesModule.Class).title)
        return parent.class as SuggestedClassesModule.Class;

      const _class = await getClass(
        parent.year,
        parent.semester,
        parent.sessionId,
        parent.subject,
        parent.courseNumber,
        parent.number
      );

      return _class as unknown as SuggestedClassesModule.Class;
    },
  },

  Mutation: {
    createPost: async (_, { post }, context) => {
      const createdPost = await createPost(context, post);
      return createdPost as unknown as SuggestedClassesModule.Post;
    },

    updatePost: async (_, { id, post }, context) => {
      const updatedPost = await updatePost(context, id, post);
      return updatedPost as unknown as SuggestedClassesModule.Post;
    },

    deletePost: async (_, { id }, context) => {
      return await deletePost(context, id);
    },
  },
};

export default {
  ...resolvers,
};
