import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "./controller";
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
