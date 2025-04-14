import { getDiscussions, addPost } from "./discussionController";
import {DiscussionModule} from "./generated-types/module-types"

const resolvers: DiscussionModule.Resolvers = {
    Query: {
        discussions: async (_, {courseNumber}) => {
            return await getDiscussions(courseNumber); 
        }
    },
    Mutation: {
        post: async (
            _, 
            { courseNumber, PostContent},
            context) => {
            return await addPost(courseNumber, PostContent, context); 
        }
    }
};

export default resolvers;

