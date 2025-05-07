import {
    postModel, 
} from "@repo/common";

import {
    CreatePostInput, 
    UpdatePostInput
} from "../../generated-types/graphql";
import { formatPost } from "./formatter";
import { SuggestedClassesModule } from "./generated-types/module-types";

export const getPosts = async (context: any) => {
    if (!context.user._id) throw new Error("Unauthorized");
    const posts = await postModel.find({
        createdBy: context.user._id, 
    });

    return await Promise.all(posts.map(formatPost));
}

export const getPostById = async (context: any, id: string) => {
    if (!context.user._id) throw new Error("Unathorized");
    const post = await postModel.findOne({
        _id: id,
        $or: [{ public: true }, { createdBy: context.user._id }],
    })
    if (!post) throw new Error ("not found");
    return await formatPost(post);
}

export const updatePost = async (context: any, num: number, input: UpdatePostInput) => {
    if (!context.user._id) throw new Error("Unauthorized");

    //need to filter out duplicates?
    const post = await postModel.findOneAndUpdate({
        courseNumber: num, 
        createdBy: context.user._id}, 
        input, 
        {new: true},
    );
    
    if (!post) throw new Error ("not found");
    return await formatPost(post);


}

export const deletePost = async (context: any, num: number) => {
    const post = await postModel.findOneAndDelete({
        _courseNumber: num,
        createdBy: context.user._id, 
    });

    if (!post) throw new Error("Not Found");

    return post._courseNumber.toString();

}

export const createPost = async (
    context: any, 
    input: CreatePostInput,
) => {
    if (!context.user._id) throw new Error ("Unauthorized");
    const post = await postModel.create({
        ...input, 
        createdBy: context.user._id, 
    })

    return await formatPost(post);
}


