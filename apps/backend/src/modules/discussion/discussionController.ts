import {DiscussionModel} from "@repo/common"
import {formatPost} from "./formater"

export const getDiscussions = async (courseNumber: string) => {
    const discussion = await DiscussionModel.findOne({courseNumber: courseNumber});
    if (!discussion) {
        return { courseNumber, posts: [] };
    }
    const discussionObject = discussion.toObject(); 
    return {
        courseNumber: discussionObject.courseNumber,
        posts: discussionObject.posts.map(formatPost)};
};

export const addPost = async(
    courseNumber: string,  
    PostContent: string,
    context: any
) => {
    const userId = context.user.id;
    const updatedPost = await DiscussionModel.findOneAndUpdate(
        { courseNumber },
        {
            $push: {  
                posts: {
                    userId,
                    PostContent,
                }
            }
        },
        { new: true, upsert: true }
    );
    if (!updatedPost) {
        throw new Error("Failed to update or create the discussion post.");
    }
    const updatedPostObj = updatedPost.toObject();
    const lastPost = updatedPostObj.posts[updatedPostObj.posts.length - 1];
    return formatPost(lastPost);
};