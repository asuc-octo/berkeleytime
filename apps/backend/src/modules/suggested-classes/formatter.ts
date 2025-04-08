import {PostType} from "@repo/common";
import { SuggestedClassesModule } from "./generated-types/module-types";

export interface PostRelationships {
    posts: SuggestedClassesModule.Post[];
}
export type IntermediatePost = PostRelationships;

export const formatPost = async (post: PostType) => {
    
    return {
        ...post, 
    }

};