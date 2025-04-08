import {getPosts, updatePost, deletePost, createPost} from "./controller";
import { SuggestedClassesModule } from "./generated-types/module-types";

const resolvers: SuggestedClassesModule.Resolvers = {
    Query: {
        getAllPosts: async (_: any, context: any) => {
            const posts = await getPosts(context);
            return posts as unknown as SuggestedClassesModule.Post[];
        }
    }, 
    Mutation: {
        addPost: async (_: any, {newPost: input}: any, context: any) => {
            const post = await createPost(context, input);
            return post as unknown as SuggestedClassesModule.Post;
        }, 

        modifyPost: async (_:any, {courseNumber, post: input}: any, context: any) {
            const post = await updatePost(context, courseNumber, input);
            return post as unknown as SuggestedClassesModule.Post;
        }, 

        deletePost: async (_: any, {courseNumber}: any, context: any) => {
            return await deletePost(context, courseNumber);
        }
        }
    };

export default resolvers;