import {postType} from "@repo/common";
import { SuggestedClassesModule } from "./generated-types/module-types";

export const formatPost = async (post: postType) => {
    return {
        semester: post.semester, 
        year: post.year,
        sessionId: post.sessionId, 
        courseNumber: post.courseNumber, 
        number: post.number,
        subject: post.subject,
        juliana: post.juliana,
    }
};