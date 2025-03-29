import mongoose, { Schema, Document, Model } from "mongoose";

interface Post {
    userId: string; 
    PostContent: string; 
    PostTime: Date;  
}
export interface DiscussionInfo extends Document {
    courseNumber: string;
    posts: Post[];
}

const postSchema: Schema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    userId: { type: String, required: true }, //connect user?
    PostTime: { type: Date, default: Date.now },
    PostContent: { type: String, required: true },
});

const discussionSchema: Schema<DiscussionInfo> = new Schema({
    courseNumber: { type: String, required: true },
    posts: { type: [postSchema], default: []},
});

export const DiscussionModel: Model<DiscussionInfo> = mongoose.model<DiscussionInfo>(
    "Discussion",
    discussionSchema
);


