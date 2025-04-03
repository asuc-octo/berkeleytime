import {postModel} from "@repo/common";


import {
    MutationAddPostArgs,
    Semester,
    SectionIdentifier, 
    ClassNumber
} from "../../generated-types/graphql";
import {formatPost} from "./formatter";
import { SuggestedClassesModule } from "./generated-types/module-types";

export const getPosts = async (context: any) => {
    if (!context.userID) throw new Error ("Unauthorized");
    const posts = await postModel.find({
        createdBy: context.user._id,
    });
    return posts.map(formatPost);
}

export const addPost = async (context:any, input: MutationAddPostArgs) => {
    const post = await postModel.create({
        ...input,
        createdBy: context.user._id,
    });
    return await formatPost(post);
}



